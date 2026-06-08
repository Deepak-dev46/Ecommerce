package com.rvz.actionservice.service.impl;

import com.rvz.actionservice.autoclose.service.AutoCloseService;
import com.rvz.actionservice.client.MailClient;
import com.rvz.actionservice.client.MasterDataClient;
import com.rvz.actionservice.client.TicketClient;
import com.rvz.actionservice.config.ActionConstants;
import com.rvz.actionservice.config.ActionMapper;
import com.rvz.actionservice.dto.request.AdditionalInputRequest;
import com.rvz.actionservice.dto.request.EmailRequest;
import com.rvz.actionservice.dto.request.TicketActionRequest;
import com.rvz.actionservice.dto.response.ActionResponse;
import com.rvz.actionservice.entity.TicketAction;
import com.rvz.actionservice.exception.ActionException;
import com.rvz.actionservice.repository.TicketActionRepository;
import com.rvz.actionservice.service.ActionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ActionServiceImpl implements ActionService {

    private static final Logger log = LoggerFactory.getLogger(ActionServiceImpl.class);

    // ── Existing dependencies (unchanged) ─────────────────────────────────────
    private final TicketActionRepository ticketActionRepository;
    private final ActionMapper           actionMapper;
    private final MailClient             mailClient;
    private final MasterDataClient       masterDataClient;
    private final TicketClient           ticketClient;

    @Value("${itsm.manager.user.id}")
    private Long itsmManagerUserId;

    // ── New dependency injected via constructor (no circular dependency) ──────
    private final AutoCloseService autoCloseService;

    public ActionServiceImpl(TicketActionRepository ticketActionRepository,
                             ActionMapper actionMapper,
                             MailClient mailClient,
                             MasterDataClient masterDataClient,
                             TicketClient ticketClient,
                             AutoCloseService autoCloseService) {
        this.ticketActionRepository = ticketActionRepository;
        this.actionMapper           = actionMapper;
        this.mailClient             = mailClient;
        this.masterDataClient       = masterDataClient;
        this.ticketClient           = ticketClient;
        this.autoCloseService       = autoCloseService;
    }

    // =========================================================================
    // EXISTING METHODS — preserved exactly, zero logic change
    // =========================================================================

    @Override
    public ActionResponse markWorking(TicketActionRequest request) {
        TicketAction action = buildAction(
                request.getTicketId(),
                ActionConstants.STATUS_WORKING,
                ActionConstants.TYPE_COMMENT,
                request.getComments(),
                request.getActionBy());
        return actionMapper.toResponse(ticketActionRepository.save(action));
    }

    @Override
    public ActionResponse addComment(TicketActionRequest request) {
        TicketAction action = buildAction(
                request.getTicketId(),
                ActionConstants.STATUS_OPEN,
                ActionConstants.TYPE_COMMENT,
                request.getComments(),
                request.getActionBy());
        return actionMapper.toResponse(ticketActionRepository.save(action));
    }

    @Override
    public ActionResponse requestAdditionalInput(AdditionalInputRequest request) {
        TicketAction action = buildAction(
                request.getTicketId(),
                ActionConstants.STATUS_OPEN,
                ActionConstants.TYPE_ADDITIONAL_INPUT,
                request.getComment(),
                request.getRequestedBy());
        TicketAction saved = ticketActionRepository.save(action);

        String requesterEmail = resolveRequesterEmail(request.getTicketId());
        if (requesterEmail != null) {
            sendEmailSafe(
                    requesterEmail,
                    "Additional Input Required – Ticket #" + request.getTicketId(),
                    "Dear Requester,\n\n"
                    + "Your support ticket #" + request.getTicketId()
                    + " requires additional information from you.\n\n"
                    + "Details: " + request.getComment() + "\n\n"
                    + "Please reply with the requested information so we can continue processing your ticket.\n\n"
                    + "Regards,\nServiceEverZ Support Team");
        }
        return actionMapper.toResponse(saved);
    }

    @Override
    public ActionResponse closeTicket(TicketActionRequest request) {
        // ── NEW: guard — CLOSED tickets are final ──────────────────────────
        Map<String, Object> ticketData = fetchTicket(request.getTicketId());
        if (ticketData != null) {
            String currentStatus = resolveStatus(ticketData);
            if (ActionConstants.STATUS_CLOSED.equalsIgnoreCase(currentStatus)) {
                throw new ActionException(
                        "Ticket " + request.getTicketId() + " is already CLOSED and cannot be closed again.");
            }
        }
        // ── END NEW ────────────────────────────────────────────────────────

        TicketAction action = buildAction(
                request.getTicketId(),
                ActionConstants.STATUS_CLOSED,
                ActionConstants.TYPE_CLOSE,
                request.getComments(),
                request.getActionBy());
        TicketAction saved = ticketActionRepository.save(action);

        // Existing email notifications — preserved exactly
        String requesterEmail = resolveRequesterEmail(request.getTicketId());
        if (requesterEmail != null) {
            sendEmailSafe(
                    requesterEmail,
                    "Ticket Closed – #" + request.getTicketId(),
                    "Dear Requester,\n\n"
                    + "Your support ticket #" + request.getTicketId() + " has been closed.\n\n"
                    + "Resolution: " + request.getComments() + "\n\n"
                    + "If you feel this issue is not fully resolved, please raise a new ticket.\n\n"
                    + "Thank you,\nServiceEverZ Support Team");
        }

        String managerEmail = resolveUserEmail(itsmManagerUserId);
        if (managerEmail != null) {
            sendEmailSafe(
                    managerEmail,
                    "Ticket Closed – #" + request.getTicketId(),
                    "Ticket #" + request.getTicketId()
                    + " has been closed by " + request.getActionBy() + ".\n\n"
                    + "Resolution: " + request.getComments());
        }

        return actionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActionResponse> getTimeline(Long ticketId) {
        return ticketActionRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(actionMapper::toResponse)
                .toList();
    }

    // =========================================================================
    // NEW METHODS — resolveTicket & reopenTicket with auto-close integration
    // =========================================================================

    /**
     * Marks a ticket as RESOLVED and starts the auto-close countdown.
     *
     * The slaId is passed in from the request so the correct auto-close
     * duration (SLA-specific or global) can be selected.
     *
     * Called via POST /api/actions/resolve
     */
    @Override
    public ActionResponse resolveTicket(TicketActionRequest request) {
        TicketAction action = buildAction(
                request.getTicketId(),
                ActionConstants.STATUS_RESOLVED,
                ActionConstants.TYPE_RESOLVE,
                request.getComments(),
                request.getActionBy());
        TicketAction saved = ticketActionRepository.save(action);

        // Notify requester
        String requesterEmail = resolveRequesterEmail(request.getTicketId());
        if (requesterEmail != null) {
            sendEmailSafe(
                    requesterEmail,
                    "Ticket Resolved – #" + request.getTicketId(),
                    "Dear Requester,\n\n"
                    + "Your ticket #" + request.getTicketId() + " has been resolved.\n\n"
                    + "Resolution: " + request.getComments() + "\n\n"
                    + "The ticket will be automatically closed if no further action is taken.\n\n"
                    + "Regards,\nServiceEverZ Support Team");
        }

        // ── AUTO-CLOSE: start countdown timer ─────────────────────────────
        autoCloseService.onTicketResolved(request.getTicketId(), request.getSlaId());
        // ── END AUTO-CLOSE ─────────────────────────────────────────────────

        log.info("Ticket {} resolved by {}. Auto-close timer started (slaId={}).",
                request.getTicketId(), request.getActionBy(), request.getSlaId());
        return actionMapper.toResponse(saved);
    }

    /**
     * Reopens a RESOLVED ticket and IMMEDIATELY stops the auto-close countdown.
     * CLOSED tickets can never be reopened — an ActionException is thrown.
     *
     * Called via POST /api/actions/reopen
     */
    @Override
    public ActionResponse reopenTicket(TicketActionRequest request) {
        // ── NEW: CLOSED tickets are final ─────────────────────────────────
        Map<String, Object> ticketData = fetchTicket(request.getTicketId());
        if (ticketData != null) {
            String currentStatus = resolveStatus(ticketData);
            if (ActionConstants.STATUS_CLOSED.equalsIgnoreCase(currentStatus)) {
                throw new ActionException(
                        "Ticket " + request.getTicketId() + " is CLOSED and cannot be reopened.");
            }
        }
        // ── END NEW ────────────────────────────────────────────────────────

        TicketAction action = buildAction(
                request.getTicketId(),
                ActionConstants.STATUS_REOPENED,
                ActionConstants.TYPE_REOPEN,
                request.getComments(),
                request.getActionBy());
        TicketAction saved = ticketActionRepository.save(action);

        // ── AUTO-CLOSE: stop timer immediately ────────────────────────────
        autoCloseService.onTicketReopened(request.getTicketId());
        // ── END AUTO-CLOSE ─────────────────────────────────────────────────

        log.info("Ticket {} reopened by {}. Auto-close timer cancelled.",
                request.getTicketId(), request.getActionBy());
        return actionMapper.toResponse(saved);
    }

    // =========================================================================
    // Private helpers — existing helpers preserved, new ones added at bottom
    // =========================================================================

    private TicketAction buildAction(Long ticketId, String status,
                                     String type, String comments, String actionBy) {
        TicketAction action = new TicketAction();
        action.setTicketId(ticketId);
        action.setStatus(status);
        action.setActionType(type);
        action.setComments(comments);
        action.setActionBy(actionBy);
        action.setCreatedAt(LocalDateTime.now());
        return action;
    }

    @SuppressWarnings("unchecked")
    private String resolveRequesterEmail(Long ticketId) {
        if (ticketId == null) return null;
        try {
            Map<String, Object> body = ticketClient.getTicketById(ticketId);
            if (body != null && body.get("data") instanceof Map) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                Object userId = data.get("requestedById");
                if (userId != null) {
                    return resolveUserEmail(Long.parseLong(userId.toString()));
                }
            }
        } catch (Exception ex) {
            log.warn("Could not resolve requester email for ticketId={}: {}", ticketId, ex.getMessage());
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String resolveUserEmail(Long userId) {
        if (userId == null || userId <= 0) return null;
        try {
            Map<String, Object> body = masterDataClient.getUserById(userId);
            if (body != null && body.get("data") instanceof Map) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                Object email = data.get("email");
                if (email instanceof String s && !s.isBlank()) {
                    return s;
                }
            }
        } catch (Exception ex) {
            log.warn("Could not resolve email for userId={}: {}", userId, ex.getMessage());
        }
        return null;
    }

    private void sendEmailSafe(String to, String subject, String body) {
        try {
            mailClient.sendEmail(new EmailRequest(to, subject, body, false));
            log.info("Email sent to {}", to);
        } catch (Exception ex) {
            log.warn("Email service call failed for {}: {}", to, ex.getMessage());
        }
    }

    /** Fetch raw ticket map from ticket-service (used for status guard checks). */
    private Map<String, Object> fetchTicket(Long ticketId) {
        try {
            return ticketClient.getTicketById(ticketId);
        } catch (Exception ex) {
            log.warn("Could not fetch ticket {} for status guard: {}", ticketId, ex.getMessage());
            return null;
        }
    }

    /** Extract status string from the ticket-service response map. */
    @SuppressWarnings("unchecked")
    private String resolveStatus(Map<String, Object> body) {
        try {
            if (body.get("data") instanceof Map) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                Object status = data.get("status");
                return status != null ? status.toString() : null;
            }
            // Some endpoints return the ticket directly (no ApiResponse wrapper)
            Object status = body.get("status");
            return status != null ? status.toString() : null;
        } catch (Exception ex) {
            log.warn("Could not extract status from ticket response: {}", ex.getMessage());
            return null;
        }
    }
}
