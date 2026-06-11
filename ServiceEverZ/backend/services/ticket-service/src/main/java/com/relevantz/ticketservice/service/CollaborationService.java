package com.relevantz.ticketservice.service;
 
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import com.relevantz.ticketservice.client.RoleServiceClient;
import com.relevantz.ticketservice.client.UserServiceClient;
import com.relevantz.ticketservice.dto.CollaborationDtos.AddInternalNoteRequest;
import com.relevantz.ticketservice.dto.CollaborationDtos.AgentMentionDto;
import com.relevantz.ticketservice.dto.CollaborationDtos.InternalNoteResponse;
import com.relevantz.ticketservice.exception.ResourceNotFoundException;
import com.relevantz.ticketservice.model.InternalNote;
import com.relevantz.ticketservice.repository.InternalNoteRepository;
import com.relevantz.ticketservice.repository.TicketRepository;
 
import jakarta.mail.internet.MimeMessage;
 
@Service
@Transactional
public class CollaborationService {
 
    private final InternalNoteRepository noteRepository;
    private final TicketRepository       ticketRepository;
    private final JavaMailSender         mailSender;
    private final UserServiceClient      userServiceClient;
    private final RoleServiceClient      roleServiceClient;
 
    @Value("${spring.mail.username:servicedesk@company.com}")
    private String fromAddress;
 
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
 
    public CollaborationService(InternalNoteRepository noteRepository,
                                TicketRepository ticketRepository,
                                JavaMailSender mailSender,
                                UserServiceClient userServiceClient,
                                RoleServiceClient roleServiceClient) {
        this.noteRepository   = noteRepository;
        this.ticketRepository = ticketRepository;
        this.mailSender       = mailSender;
        this.userServiceClient = userServiceClient;
        this.roleServiceClient = roleServiceClient;
    }
 
    // ── Add Internal Note + Send Mention Emails ───────────────────────────────
 
    public InternalNoteResponse addInternalNote(AddInternalNoteRequest request,
                                                List<AgentMentionDto> mentionedAgents) {
 
        // Validate ticket exists
        ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found: " + request.getTicketId()));
 
        // Build and save entity
        InternalNote note = new InternalNote();
        note.setTicketId(request.getTicketId());
        note.setAuthorId(request.getAuthorId());
        note.setAuthorName(request.getAuthorName());
        note.setContent(request.getContent());
 
        if (request.getMentionedAgentIds() != null
                && !request.getMentionedAgentIds().isEmpty()) {
            String ids = request.getMentionedAgentIds().stream()
                    .map(String::valueOf).collect(Collectors.joining(","));
            note.setMentionUserIds(ids);
        }
 
        InternalNote saved = noteRepository.save(note);
 
        // Send email to every mentioned agent
        if (mentionedAgents != null && !mentionedAgents.isEmpty()) {
            for (AgentMentionDto agent : mentionedAgents) {
                sendMentionEmail(
                    agent,
                    request.getAuthorName(),
                    request.getTicketId(),
                    request.getContent()
                );
            }
        }
 
        return InternalNoteResponse.from(saved);
    }
 
    // ── Get Notes ─────────────────────────────────────────────────────────────
 
    public List<InternalNoteResponse> getInternalNotes(Long ticketId) {
        return noteRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(InternalNoteResponse::from).toList();
    }
 
    // ── Mention Suggestions ───────────────────────────────────────────────────
 
    public List<AgentMentionDto> getMentionSuggestions(String query) {
        try {
            List<Long> userIds =
                    roleServiceClient.getUserIdsByRoleName("SUPPORT_PERSONNEL");
            if (userIds == null || userIds.isEmpty()) return List.of();
 
            String ids = userIds.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
 
            List<Map<String, Object>> users = userServiceClient.getUsersByIds(ids);
 
            return users.stream()
                .map(u -> {
                    Long   uid  = u.get("id") != null
                                  ? Long.valueOf(u.get("id").toString()) : null;
                    String name = (String) u.getOrDefault("fullName", "");
                    if (name.isBlank()) {
                        name = ((String) u.getOrDefault("firstName", "")
                              + " "
                              + (String) u.getOrDefault("lastName", "")).trim();
                    }
                    String email = (String) u.getOrDefault("email", "");
                    if (!query.isBlank()
                        && !name.toLowerCase().contains(query.toLowerCase())
                        && !email.toLowerCase().contains(query.toLowerCase())) {
                        return null;
                    }
                    return new AgentMentionDto(uid, name, email);
                })
                .filter(Objects::nonNull)
                .toList();
        } catch (Exception e) {
            System.err.println("[CollaborationService] getMentionSuggestions error: "
                    + e.getMessage());
            return List.of();
        }
    }
 
    // ── Send Mention Email ────────────────────────────────────────────────────
 
    private void sendMentionEmail(AgentMentionDto agent, String mentionedBy,
                                  Long ticketId, String noteContent) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
 
            helper.setFrom(fromAddress);
            helper.setTo(agent.getEmail());
            helper.setSubject("You were mentioned in Ticket #" + ticketId);
 
            String ticketUrl = frontendUrl + "/itsm/support/tickets/" + ticketId;
 
            String body = "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<div style='max-width:600px;margin:auto;border:1px solid #e0e0e0;"
                +      "border-radius:8px;overflow:hidden'>"
 
                + "<div style='background:linear-gradient(135deg,#27235C,#97247E);"
                +      "padding:20px 24px'>"
                + "<h2 style='color:#fff;margin:0'>📌 You were mentioned</h2>"
                + "<p style='color:#ddd;margin:4px 0 0'>ServiceEverZ — Internal Note</p>"
                + "</div>"
 
                + "<div style='padding:24px'>"
                + "<p>Hi <b>" + agent.getFullName() + "</b>,</p>"
                + "<p><b>" + mentionedBy + "</b> mentioned you in an internal note "
                +    "on <b>Ticket #" + ticketId + "</b>.</p>"
 
                + "<div style='background:#fffde7;border-left:4px solid #f9a825;"
                +      "padding:12px 16px;border-radius:4px;margin:16px 0'>"
                + "<p style='margin:0;font-size:14px;color:#555'>"
                + escapeHtml(noteContent)
                + "</p></div>"
 
                + "<a href='" + ticketUrl + "' "
                +    "style='display:inline-block;padding:10px 20px;"
                +           "background:#27235C;color:#fff;text-decoration:none;"
                +           "border-radius:6px;font-weight:bold'>View Ticket</a>"
 
                + "<p style='margin-top:24px;font-size:12px;color:#999'>"
                +    "— ServiceEverZ Service Desk</p>"
                + "</div></div>"
                + "</body></html>";
 
            helper.setText(body, true);
            mailSender.send(msg);
 
            System.out.println("[CollaborationService] Mention email sent to "
                    + agent.getEmail() + " for ticket #" + ticketId);
 
        } catch (Exception e) {
            System.err.println("[CollaborationService] Failed to send mention email to "
                    + agent.getEmail() + ": " + e.getMessage());
        }
    }
 
    // ── HTML Escape ───────────────────────────────────────────────────────────
 
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}
 
 