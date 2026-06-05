package com.relevantz.ticketservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.relevantz.ticketservice.client.UserServiceClient;
import com.relevantz.ticketservice.dto.CollaborationDtos.AddInternalNoteRequest;
import com.relevantz.ticketservice.dto.CollaborationDtos.AgentMentionDto;
import com.relevantz.ticketservice.dto.CollaborationDtos.InternalNoteResponse;
import com.relevantz.ticketservice.exception.ResourceNotFoundException;
import com.relevantz.ticketservice.model.InternalNote;
import com.relevantz.ticketservice.repository.InternalNoteRepository;
import com.relevantz.ticketservice.repository.TicketRepository;

import jakarta.mail.internet.MimeMessage;

/**
 * Sub-module 01 — Collaboration Service
 *
 * Responsibilities:
 *  - Create / retrieve private internal (work) notes on tickets.
 *  - Parse @mentions, fire in-app + email notifications to mentioned agents.
 *  - Only active support agents may be mentioned (validated by role check header).
 */
@Service
@Transactional
public class CollaborationService {

    private final InternalNoteRepository noteRepository;
    private final TicketRepository ticketRepository;
    private final JavaMailSender mailSender;
    private final UserServiceClient userServiceClient;

    @Value("${spring.mail.username:servicedesk@company.com}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public CollaborationService(InternalNoteRepository noteRepository,
            TicketRepository ticketRepository,
            JavaMailSender mailSender,
            UserServiceClient userServiceClient) {
this.noteRepository = noteRepository;
this.ticketRepository = ticketRepository;
this.mailSender = mailSender;
this.userServiceClient = userServiceClient;
}

    // ── Add Internal Note ─────────────────────────────────────────────────────

    /**
     * Saves a new internal work note and fires @mention notifications.
     *
     * @param request  payload from the support agent UI
     * @param mentionedAgentEmails  map of agentId → email for mentioned agents
     *                              (resolved by the controller from user-service)
     */
    public InternalNoteResponse addInternalNote(AddInternalNoteRequest request,
                                                List<AgentMentionDto> mentionedAgents) {

        // Validate ticket exists
        ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found: " + request.getTicketId()));

        // Build entity
        InternalNote note = new InternalNote();
        note.setTicketId(request.getTicketId());
        note.setAuthorId(request.getAuthorId());
        note.setAuthorName(request.getAuthorName());
        note.setContent(request.getContent());

        if (request.getMentionedAgentIds() != null && !request.getMentionedAgentIds().isEmpty()) {
            String ids = request.getMentionedAgentIds().stream()
                    .map(String::valueOf).collect(Collectors.joining(","));
            note.setMentionUserIds(ids);
        }

        InternalNote saved = noteRepository.save(note);

        // Fire @mention notifications asynchronously
        if (mentionedAgents != null && !mentionedAgents.isEmpty()) {
            for (AgentMentionDto agent : mentionedAgents) {
                sendMentionEmail(agent, request.getAuthorName(),
                        request.getTicketId(), request.getContent());
            }
        }

        return InternalNoteResponse.from(saved);
    }

    // ── Get All Internal Notes for a Ticket ───────────────────────────────────

    /**
     * Returns all work notes for a ticket. Called ONLY by support-role endpoints.
     * The portal/end-user endpoints must NEVER call this method.
     */
    public List<InternalNoteResponse> getInternalNotes(Long ticketId) {
        return noteRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(InternalNoteResponse::from).toList();
    }

    // ── Email Notification for @Mention ──────────────────────────────────────

    private void sendMentionEmail(AgentMentionDto agent, String mentionedBy,
                                  Long ticketId, String noteContent) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(agent.getEmail());
            helper.setSubject("You were mentioned in Ticket #" + ticketId);

            String ticketUrl = frontendUrl + "/itsm/tickets/" + ticketId;
            String body = "<html><body>"
                    + "<h3>You were mentioned in a ticket discussion</h3>"
                    + "<p><b>Mentioned by:</b> " + mentionedBy + "</p>"
                    + "<p><b>Ticket ID:</b> " + ticketId + "</p>"
                    + "<p><b>Note:</b></p>"
                    + "<blockquote style='border-left:4px solid #ccc;padding-left:12px;color:#555'>"
                    + escapeHtml(noteContent)
                    + "</blockquote>"
                    + "<p><a href='" + ticketUrl + "'>View Ticket</a></p>"
                    + "<p>— Service Desk Team</p>"
                    + "</body></html>";

            helper.setText(body, true);
            mailSender.send(msg);
        } catch (Exception e) {
            // Log and continue — do not fail the note-save operation
            System.err.println("[CollaborationService] Failed to send mention email to "
                    + agent.getEmail() + ": " + e.getMessage());
        }
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }

    // public List<AgentMentionDto> getMentionSuggestions(String query) {
    //     try {
    //         return userServiceClient.searchSupportAgents(query);
    //     } catch (Exception e) {
    //         System.err.println("[CollaborationService] Error fetching mention suggestions: " + e.getMessage());
    //         return List.of(); // prevent crash
    //     }
    // }

	
}
