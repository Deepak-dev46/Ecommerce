package com.relevantz.ticketservice.service;

import com.relevantz.ticketservice.dto.CsatDtos.*;
import com.relevantz.ticketservice.model.CsatSurvey;
import com.relevantz.ticketservice.model.Ticket;
import com.relevantz.ticketservice.repository.CsatSurveyRepository;
import com.relevantz.ticketservice.repository.TicketRepository;
import com.relevantz.ticketservice.exception.ResourceNotFoundException;
import com.relevantz.ticketservice.exception.BadRequestException;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

/**
 * Sub-module 02 — CSAT / Feedback Service
 *
 * Responsibilities:
 *  - Trigger survey email when ticket moves to RESOLVED or CLOSED.
 *  - Prevent duplicate surveys (idempotent — safe to call on reopen/reclose).
 *  - Decode token from survey link and return pre-filled form data.
 *  - Save feedback with anonymous-data stripping.
 *  - Provide ISTM Manager dashboard data.
 */
@Service
@Transactional
public class CsatService {

    private final CsatSurveyRepository csatRepository;
    private final TicketRepository ticketRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:servicedesk@company.com}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public CsatService(CsatSurveyRepository csatRepository,
                       TicketRepository ticketRepository,
                       JavaMailSender mailSender) {
        this.csatRepository  = csatRepository;
        this.ticketRepository = ticketRepository;
        this.mailSender       = mailSender;
    }

    // ── Trigger Survey on Ticket Resolved / Closed ────────────────────────────

    /**
     * Called by TicketService when ticket status changes to RESOLVED or CLOSED.
     * Idempotent — will NOT send a second email if one was already sent.
     *
     * @param ticketId        resolved/closed ticket
     * @param requesterEmail  email address to send the survey to
     */
    public void triggerSurveyIfNeeded(Long ticketId, String requesterEmail) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        // ── Duplicate prevention ──────────────────────────────────────────────
        Optional<CsatSurvey> existing = csatRepository.findByTicketId(ticketId);
        if (existing.isPresent() && Boolean.TRUE.equals(existing.get().getSurveySent())) {
            System.out.println("[CsatService] Survey already sent for ticket " + ticketId + " — skipping.");
            return;
        }

        // Create or update the survey record (no rating yet — awaiting user response)
        CsatSurvey survey = existing.orElse(new CsatSurvey());
        survey.setTicketId(ticketId);
        survey.setTicketNumber(ticket.getTicketNumber());
        survey.setRequesterName(ticket.getRequesterName());
        survey.setRequesterUserId(ticket.getUserId());
        survey.setResolvedById(ticket.getAssigneeId());
        survey.setResolvedByName(ticket.getAssigneeName());
        survey.setCategoryName(ticket.getCategoryName());
        survey.setSurveySent(true);
        csatRepository.save(survey);

        // Build token for survey link
        String token = buildSurveyToken(ticket, requesterEmail);
        String surveyLink = frontendUrl + "/feedback?token=" + token;

        sendSurveyEmail(requesterEmail, ticket.getTicketNumber(), surveyLink,
                ticket.getRequesterName());
    }

    // ── Decode Token → Pre-filled Form Data ──────────────────────────────────

    /**
     * Decodes the Base64 survey token sent in the email link.
     * Returns pre-mapped form data so the frontend can auto-fill fields.
     */
    public SurveyTokenPayload decodeSurveyToken(String token) {
        try {
            String json = new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8);
            // Simple manual parsing — keeps the service free of extra JSON lib deps
            SurveyTokenPayload payload = new SurveyTokenPayload();
            payload.setTicketId(extractLong(json, "ticketId"));
            payload.setTicketNumber(extractString(json, "ticketNumber"));
            payload.setRequesterName(extractString(json, "requesterName"));
            payload.setRequesterUserId(extractLong(json, "requesterUserId"));
            payload.setResolvedById(extractLong(json, "resolvedById"));
            payload.setResolvedByName(extractString(json, "resolvedByName"));
            payload.setCategoryName(extractString(json, "categoryName"));
            payload.setRequesterEmail(extractString(json, "requesterEmail"));
            return payload;
        } catch (Exception e) {
            throw new BadRequestException("Invalid or expired survey token.");
        }
    }

    // ── Submit Feedback ───────────────────────────────────────────────────────

    /**
     * Saves submitted feedback. Applies anonymous-data stripping per spec.
     */
    public CsatSurveyResponse submitFeedback(SubmitFeedbackRequest req) {

        // Duplicate submission check
        if (req.getTicketId() != null) {
            Optional<CsatSurvey> existing = csatRepository.findByTicketId(req.getTicketId());
            if (existing.isPresent() && existing.get().getRating() != null) {
                throw new BadRequestException("Feedback already submitted for this ticket.");
            }
        }

        CsatSurvey survey;

        if (req.getTicketId() != null) {
            // Update the existing placeholder record
            survey = csatRepository.findByTicketId(req.getTicketId())
                     .orElse(new CsatSurvey());
        } else {
            // Anonymous with no ticket ref — create fresh
            survey = new CsatSurvey();
        }

        // Always store
        survey.setResolvedById(req.getResolvedById());
        survey.setResolvedByName(req.getResolvedByName());
        survey.setCategoryName(req.getCategoryName());
        survey.setRating(req.getRating());
        survey.setComments(req.getComments());
        survey.setAnonymous(req.getAnonymous());
        survey.setSurveySent(true);
        survey.setTicketId(req.getTicketId());

        if (Boolean.TRUE.equals(req.getAnonymous())) {
            // ── Anonymous: STRIP user-identifying fields ──────────────────────
            survey.setTicketNumber(null);
            survey.setRequesterName(null);
            survey.setRequesterUserId(null);
        } else {
            // ── Non-anonymous: store all fields ──────────────────────────────
            survey.setTicketId(req.getTicketId());
            survey.setTicketNumber(req.getTicketNumber());
            survey.setRequesterName(req.getRequesterName());
            survey.setRequesterUserId(req.getRequesterUserId());
        }

        return CsatSurveyResponse.from(csatRepository.save(survey));
    }

    // ── ISTM Manager Dashboard ────────────────────────────────────────────────

    /** Full list of all submitted feedback — ISTM Manager only */
    public CsatDashboardSummary getDashboard(Long agentId, String category,
                                              LocalDateTime from, LocalDateTime to) {
        List<CsatSurvey> records;

        if (from != null && to != null) {
            records = csatRepository.findByDateRange(from, to);
        } else if (agentId != null) {
            records = csatRepository.findByResolvedByIdAndRatingIsNotNull(agentId);
        } else if (category != null && !category.isBlank()) {
            records = csatRepository.findByCategoryNameAndRatingIsNotNull(category);
        } else {
            records = csatRepository.findByRatingIsNotNull();
        }

        Double overall = csatRepository.findOverallAverageRating();
        if (overall == null) overall = 0.0;

        List<CsatSurveyResponse> responses = records.stream()
                .map(CsatSurveyResponse::from).toList();

        return new CsatDashboardSummary(overall, (long) records.size(), responses);
    }

    // ── Email Sender ──────────────────────────────────────────────────────────

    private void sendSurveyEmail(String to, String ticketNumber,
                                  String surveyLink, String userName) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("Feedback Request for Ticket " + ticketNumber);

            String body = "<html><body>"
                    + "<p>Hello " + escapeHtml(userName) + ",</p>"
                    + "<p>Your ticket <b>" + ticketNumber + "</b> has been resolved successfully.</p>"
                    + "<p>Please provide your feedback by clicking below:</p>"
                    + "<p><a href='" + surveyLink + "' style='"
                    +    "background:#1976d2;color:#fff;padding:10px 20px;"
                    +    "text-decoration:none;border-radius:4px;display:inline-block'>"
                    +    "Provide Feedback"
                    + "</a></p>"
                    + "<p>Thank you,<br/>Service Desk Team</p>"
                    + "</body></html>";

            helper.setText(body, true);
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("[CsatService] Failed to send survey email to " + to
                    + ": " + e.getMessage());
        }
    }

    // ── Token helpers ─────────────────────────────────────────────────────────

    private String buildSurveyToken(Ticket ticket, String requesterEmail) {
        String json = "{"
            + "\"ticketId\":" + ticket.getTicketId() + ","
            + "\"ticketNumber\":\"" + ticket.getTicketNumber() + "\","
            + "\"requesterName\":\"" + ticket.getRequesterName() + "\","
            + "\"requesterUserId\":" + ticket.getUserId() + ","
            + "\"resolvedById\":" + ticket.getAssigneeId() + ","
            + "\"resolvedByName\":\"" + safe(ticket.getAssigneeName()) + "\","
            + "\"categoryName\":\"" + safe(ticket.getCategoryName()) + "\","
            + "\"requesterEmail\":\"" + requesterEmail + "\""
            + "}";
        return Base64.getUrlEncoder().withoutPadding()
                     .encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    private String safe(String s) { return s == null ? "" : s; }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    // Minimal JSON field extractors (avoids adding Jackson dependency for a token)
    private String extractString(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start == -1) return null;
        start += search.length();
        int end = json.indexOf("\"", start);
        return end == -1 ? null : json.substring(start, end);
    }

    private Long extractLong(String json, String key) {
        String search = "\"" + key + "\":";
        int start = json.indexOf(search);
        if (start == -1) return null;
        start += search.length();
        int end = json.indexOf(",", start);
        if (end == -1) end = json.indexOf("}", start);
        if (end == -1) return null;
        try { return Long.parseLong(json.substring(start, end).trim()); }
        catch (NumberFormatException e) { return null; }
    }
}
