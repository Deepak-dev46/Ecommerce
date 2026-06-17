package com.rvz.actionservice.autoclose.scheduler;

import com.rvz.actionservice.autoclose.entity.TicketAutoCloseState;
import com.rvz.actionservice.autoclose.enums.AutoCloseStatus;
import com.rvz.actionservice.autoclose.repository.TicketAutoCloseStateRepository;
import com.rvz.actionservice.config.ActionConstants;
import com.rvz.actionservice.dto.request.TicketActionRequest;
import com.rvz.actionservice.exception.ActionException;
import com.rvz.actionservice.service.ActionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job that runs every 60 seconds.
 *
 * Finds all PENDING auto-close records whose countdown has expired and
 * closes the tickets by calling the existing ActionService.closeTicket().
 *
 * Resilience: if closing one ticket fails, the error is logged and the
 * remaining tickets are still processed. A failed ticket remains PENDING
 * and will be retried on the next run.
 */
@Component
public class AutoCloseScheduler {

    private static final Logger log = LoggerFactory.getLogger(AutoCloseScheduler.class);

    /**
     * System actor string used in the ticket_actions record.
     * Matches the actionBy field in TicketAction (String type in your entity).
     */
    private static final String SYSTEM_ACTOR = "SYSTEM";

    private static final String AUTO_CLOSE_COMMENT =
            "Ticket automatically closed by system after resolution period expired.";

    private final TicketAutoCloseStateRepository stateRepository;
    private final ActionService actionService;

    public AutoCloseScheduler(TicketAutoCloseStateRepository stateRepository,
                              ActionService actionService) {
        this.stateRepository = stateRepository;
        this.actionService   = actionService;
    }

    /**
     * Polls every 60 seconds for tickets due for auto-closure.
     * fixedDelay ensures the next run starts 60s after the previous run completes,
     * preventing overlapping executions.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void processAutoClosures() {
        LocalDateTime now = LocalDateTime.now();
        List<TicketAutoCloseState> dueStates =
                stateRepository.findDueForAutoClose(AutoCloseStatus.PENDING, now);

        if (dueStates.isEmpty()) {
            return;
        }

        log.info("[AutoCloseScheduler] Found {} ticket(s) due for auto-closure.", dueStates.size());

        for (TicketAutoCloseState state : dueStates) {
            try {
                closeTicket(state);
            } catch (Exception ex) {
                // Log and continue — do NOT rethrow; other tickets must still be processed.
                log.error("[AutoCloseScheduler] Failed to auto-close ticketId={}. Will retry. Error: {}",
                        state.getTicketId(), ex.getMessage(), ex);
            }
        }
    }

    private void closeTicket(TicketAutoCloseState state) {
        Long ticketId = state.getTicketId();
        log.info("[AutoCloseScheduler] Auto-closing ticketId={} (resolvedAt={}, scheduledAt={})",
                ticketId, state.getResolvedAt(), state.getScheduledCloseAt());

        // Build a TicketActionRequest that matches your existing closeTicket() signature
        TicketActionRequest request = new TicketActionRequest();
        request.setTicketId(ticketId);
        request.setActionBy(SYSTEM_ACTOR);
        request.setComments(AUTO_CLOSE_COMMENT);

        // Delegates to the existing ActionService.closeTicket() — reuses all email/history logic
        actionService.closeTicket(request);

        // Only mark as CLOSED in our state table after the service call succeeds
        state.markClosed();
        stateRepository.save(state);

        log.info("[AutoCloseScheduler] Successfully auto-closed ticketId={}.", ticketId);
    }
}
