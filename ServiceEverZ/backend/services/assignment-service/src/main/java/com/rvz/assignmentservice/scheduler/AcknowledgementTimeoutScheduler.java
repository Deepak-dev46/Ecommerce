package com.rvz.assignmentservice.scheduler;

import com.rvz.assignmentservice.entity.TicketAssignment;
import com.rvz.assignmentservice.repository.TicketAssignmentRepository;
import com.rvz.assignmentservice.service.AssignmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Runs every 5 minutes.
 * Finds all ASSIGNED tickets where assignedAt + 30 minutes < now
 * and acknowledgement has NOT been made, then reassigns to next person.
 *
 * IMPORTANT: Add @EnableScheduling to AssignmentServiceApplication:
 *
 *   @SpringBootApplication
 *   @EnableScheduling        ← ADD THIS
 *   public class AssignmentServiceApplication {
 *       public static void main(String[] args) {
 *           SpringApplication.run(AssignmentServiceApplication.class, args);
 *       }
 *   }
 *
 * Place this file in:
 *   assignment-service/src/main/java/com/rvz/assignmentservice/scheduler/
 */
@Component
public class AcknowledgementTimeoutScheduler {

    private static final Logger log = LoggerFactory.getLogger(AcknowledgementTimeoutScheduler.class);

    private final TicketAssignmentRepository assignmentRepository;
    private final AssignmentService          assignmentService;

    public AcknowledgementTimeoutScheduler(TicketAssignmentRepository repo,
                                            AssignmentService svc) {
        this.assignmentRepository = repo;
        this.assignmentService    = svc;
    }

    /**
     * Runs every 5 minutes (300,000 ms initial delay of 60 seconds so app starts first).
     *
     * Logic:
     * 1. Find all TicketAssignment records with status = ASSIGNED
     * 2. Filter those where acknowledgedAt IS NULL (not yet acknowledged)
     * 3. Filter those where assignedAt is older than 30 minutes
     * 4. Call checkAndReassignIfTimeout() for each — this:
     *    - Picks next person via round-robin (fewest active tickets)
     *    - Emails ITSM manager (real email from master-service DB)
     *    - Emails new assignee (real email from master-service DB)
     *    - Updates assignment status to REASSIGNED
     */
    @Scheduled(initialDelay = 60_000, fixedDelay = 300_000)
    public void checkAcknowledgementTimeouts() {
        log.info("[Scheduler] Running acknowledgement timeout check at {}", LocalDateTime.now());

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);

        List<TicketAssignment> timedOut = assignmentRepository.findAll()
                .stream()
                .filter(a -> "ASSIGNED".equals(a.getStatus()))
                .filter(a -> a.getAcknowledgedAt() == null)
                .filter(a -> a.getAssignedAt() != null && a.getAssignedAt().isBefore(cutoff))
                .collect(Collectors.toList());

        if (timedOut.isEmpty()) {
            log.info("[Scheduler] No timed-out assignments found.");
            return;
        }

        log.info("[Scheduler] Found {} timed-out assignment(s) — reassigning...", timedOut.size());

        for (TicketAssignment assignment : timedOut) {
            try {
                log.info("[Scheduler] Reassigning ticketId={} (assigned to: {}, assigned at: {})",
                        assignment.getTicketId(),
                        assignment.getSupportPersonName(),
                        assignment.getAssignedAt());

                assignmentService.checkAndReassignIfTimeout(assignment.getTicketId());

                log.info("[Scheduler] Successfully reassigned ticketId={}", assignment.getTicketId());
            } catch (Exception e) {
                log.error("[Scheduler] Failed to reassign ticketId={}: {}",
                        assignment.getTicketId(), e.getMessage());
            }
        }
    }
}
