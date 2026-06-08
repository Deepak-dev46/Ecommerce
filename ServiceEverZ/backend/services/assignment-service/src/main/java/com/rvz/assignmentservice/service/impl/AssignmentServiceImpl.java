// package com.rvz.assignmentservice.service.impl;

// import com.rvz.assignmentservice.client.MailClient;
// import com.rvz.assignmentservice.client.MasterDataClient;
// import com.rvz.assignmentservice.client.TicketClient;
// import com.rvz.assignmentservice.config.AssignmentConstants;
// import com.rvz.assignmentservice.config.AssignmentMapper;
// import com.rvz.assignmentservice.dto.request.AcknowledgeRequest;
// import com.rvz.assignmentservice.dto.request.EmailRequest;
// import com.rvz.assignmentservice.dto.request.TriggerAssignmentRequest;
// import com.rvz.assignmentservice.dto.response.AssignmentResponse;
// import com.rvz.assignmentservice.entity.SupportPersonnelCapacity;
// import com.rvz.assignmentservice.entity.TicketAssignment;
// import com.rvz.assignmentservice.exception.AssignmentException;
// import com.rvz.assignmentservice.exception.ResourceNotFoundException;
// import com.rvz.assignmentservice.repository.SupportPersonnelCapacityRepository;
// import com.rvz.assignmentservice.repository.TicketAssignmentRepository;
// import com.rvz.assignmentservice.service.AssignmentService;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
// import java.util.*;
// import java.util.stream.Collectors;

// @Service
// @Transactional
// public class AssignmentServiceImpl implements AssignmentService {

//     private static final Logger log = LoggerFactory.getLogger(AssignmentServiceImpl.class);

//     private final TicketAssignmentRepository      ticketRepo;
//     private final SupportPersonnelCapacityRepository capacityRepo;
//     private final AssignmentMapper                mapper;
//     private final MailClient                      mailClient;
//     private final MasterDataClient                masterDataClient;
//     private final TicketClient                    ticketClient;

//     @Value("${itsm.manager.user.id:0}")
//     private Long itsmManagerUserId;

//     public AssignmentServiceImpl(TicketAssignmentRepository ticketRepo,
//                                   SupportPersonnelCapacityRepository capacityRepo,
//                                   AssignmentMapper mapper,
//                                   MailClient mailClient,
//                                   MasterDataClient masterDataClient,
//                                   TicketClient ticketClient) {
//         this.ticketRepo       = ticketRepo;
//         this.capacityRepo     = capacityRepo;
//         this.mapper           = mapper;
//         this.mailClient       = mailClient;
//         this.masterDataClient = masterDataClient;
//         this.ticketClient     = ticketClient;
//     }

//     // ── Round-Robin selection ────────────────────────────────────────────────
//     private SupportPersonnelCapacity selectNextPerson(
//             List<SupportPersonnelCapacity> activePersonnel,
//             Long excludePersonId) {

//         List<TicketAssignment> allActive = ticketRepo.findAll().stream()
//                 .filter(a -> AssignmentConstants.STATUS_ASSIGNED.equals(a.getStatus())
//                           || AssignmentConstants.STATUS_OPEN.equals(a.getStatus()))
//                 .collect(Collectors.toList());

//         Map<Long, Long> countMap = allActive.stream()
//                 .collect(Collectors.groupingBy(TicketAssignment::getSupportPersonId, Collectors.counting()));

//         Map<Long, LocalDateTime> lastAssigned = ticketRepo.findAll().stream()
//                 .filter(a -> a.getAssignedAt() != null)
//                 .collect(Collectors.toMap(
//                         TicketAssignment::getSupportPersonId,
//                         TicketAssignment::getAssignedAt,
//                         (existing, replacement) -> replacement.isAfter(existing) ? replacement : existing
//                 ));

//         return activePersonnel.stream()
//                 .filter(p -> excludePersonId == null || !p.getSupportPersonId().equals(excludePersonId))
//                 .min(Comparator
//                         .comparingLong((SupportPersonnelCapacity p) ->
//                                 countMap.getOrDefault(p.getSupportPersonId(), 0L))
//                         .thenComparing(p -> lastAssigned.getOrDefault(
//                                 p.getSupportPersonId(),
//                                 LocalDateTime.MIN))
//                 )
//                 .orElseThrow(() -> new AssignmentException("No eligible support personnel found"));
//     }

//     // ── triggerAssignment ────────────────────────────────────────────────────
//     @Override
//     public AssignmentResponse triggerAssignment(TriggerAssignmentRequest request) {
//         log.info("Triggering assignment for ticketId={}", request.getTicketId());

//         List<SupportPersonnelCapacity> active = capacityRepo.findByActiveTrue();
//         if (active.isEmpty()) {
//             throw new AssignmentException("No active support personnel available");
//         }

//         SupportPersonnelCapacity selected;

//         if (request.getSupportPersonId() != null) {
//             selected = active.stream()
//                     .filter(p -> p.getSupportPersonId().equals(request.getSupportPersonId()))
//                     .findFirst()
//                     .orElseThrow(() -> new AssignmentException(
//                             "Support person " + request.getSupportPersonId() + " not found or inactive"));
//             log.info("Manual assignment: ticketId={} → personId={} ({})",
//                     request.getTicketId(), selected.getSupportPersonId(), selected.getSupportPersonName());
//         } else {
//             selected = selectNextPerson(active, null);
//             log.info("Auto round-robin: ticketId={} → personId={} ({})",
//                     request.getTicketId(), selected.getSupportPersonId(), selected.getSupportPersonName());
//         }

//         TicketAssignment assignment = ticketRepo.findByTicketId(request.getTicketId())
//                 .orElse(new TicketAssignment());

//         assignment.setTicketId(request.getTicketId());
//         assignment.setSupportPersonId(selected.getSupportPersonId());
//         assignment.setSupportPersonName(selected.getSupportPersonName());
//         assignment.setPriority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM");
//         assignment.setEstimatedHours(request.getEstimatedHours());
//         assignment.setResponseTimeHours(request.getResponseTimeHours());
//         assignment.setRemainingHours(null);
//         assignment.setStatus(AssignmentConstants.STATUS_ASSIGNED);
//         assignment.setAssignedAt(LocalDateTime.now());
//         assignment.setReassigned(false);

//          TicketAssignment saved = ticketRepo.save(assignment);
 
//         // Update ticket-service with assignee name and ID so support dashboard shows correctly
//         // try {
//         //     Map<String, Object> assignBody = new HashMap<>();
//         //     assignBody.put("assigneeId", selected.getSupportPersonId());
//         //     assignBody.put("assigneeName", selected.getSupportPersonName());
//         //     ticketClient.assignTicket(request.getTicketId(), assignBody);
//         //     log.info("Ticket {} assigned to {} (id={}) in ticket-service",
//         //         request.getTicketId(), selected.getSupportPersonName(), selected.getSupportPersonId());
//         // } catch (Exception ex) {
//         //     log.warn("Could not update assignee in ticket-service for ticketId={}: {}",
//         //         request.getTicketId(), ex.getMessage());
//         // }
 
//           try {
//             Map<String, Object> assignBody = new HashMap<>();
//             assignBody.put("assigneeId",   selected.getSupportPersonId());
//             assignBody.put("assigneeName", selected.getSupportPersonName());
//             ticketClient.assignTicket(request.getTicketId(), assignBody);
//             log.info("Ticket #{} assignee set to {} (id={}) in ticket-service",
//                 request.getTicketId(), selected.getSupportPersonName(), selected.getSupportPersonId());
//         } catch (Exception ex) {
//             log.warn("Could not update assignee in ticket-service for ticketId={}: {}",
//                 request.getTicketId(), ex.getMessage());
//         }
//         String email = resolveUserEmail(selected.getSupportPersonId());
//         if (email != null) {
//             sendEmail(email,
//                 "Ticket Assigned — #" + request.getTicketId(),
//                 "Ticket #" + request.getTicketId() + " has been assigned to you ("
//                 + selected.getSupportPersonName() + ").\n"
//                 + "Please acknowledge within 30 minutes via the Support Dashboard.");
//         }

//         return mapper.toResponse(saved);
//     }

//     // ── acknowledgeTicket ────────────────────────────────────────────────────
//     @Override
//     public AssignmentResponse acknowledgeTicket(AcknowledgeRequest request) {
//         TicketAssignment assignment = ticketRepo.findByTicketId(request.getTicketId())
//                 .orElseThrow(() -> new ResourceNotFoundException(
//                         AssignmentConstants.TICKET_NOT_FOUND + request.getTicketId()));

//         if (!assignment.getSupportPersonId().equals(request.getSupportPersonId())) {
//             throw new AssignmentException("Only the assigned support person can acknowledge this ticket");
//         }

//         assignment.setStatus(AssignmentConstants.STATUS_OPEN);
//         assignment.setAcknowledgedAt(LocalDateTime.now());
//         TicketAssignment saved = ticketRepo.save(assignment);
         
//             try {
//             Map<String, Object> assignBody = new HashMap<>();
//             assignBody.put("assigneeId",   assignment.getSupportPersonId());
//             assignBody.put("assigneeName", assignment.getSupportPersonName());
//             ticketClient.assignTicket(assignment.getTicketId(), assignBody);
//             log.info("Ticket #{} assignee confirmed on acknowledge: {} (id={})",
//                 assignment.getTicketId(), assignment.getSupportPersonName(), assignment.getSupportPersonId());
//         } catch (Exception ex) {
//             log.warn("Could not confirm assignee on acknowledge for ticketId={}: {}",
//                 assignment.getTicketId(), ex.getMessage());
//         }

//         String requesterEmail = resolveRequesterEmail(request.getTicketId());
//         if (requesterEmail != null) {
//             sendEmail(requesterEmail,
//                 "Ticket #" + assignment.getTicketId() + " — Assigned and In Progress",
//                 "Your IT service ticket #" + assignment.getTicketId()
//                 + " has been assigned to " + assignment.getSupportPersonName()
//                 + " and is now in progress.");
//         }

//         return mapper.toResponse(saved);
//     }

//     // ── checkAndReassignIfTimeout ────────────────────────────────────────────
//     @Override
//     public AssignmentResponse checkAndReassignIfTimeout(Long ticketId) {
//         TicketAssignment assignment = ticketRepo.findByTicketId(ticketId)
//                 .orElseThrow(() -> new ResourceNotFoundException(AssignmentConstants.TICKET_NOT_FOUND + ticketId));

//         if (assignment.getAcknowledgedAt() != null ||
//             !AssignmentConstants.STATUS_ASSIGNED.equals(assignment.getStatus())) {
//             return mapper.toResponse(assignment);
//         }

//         if (!LocalDateTime.now().isAfter(assignment.getAssignedAt().plusMinutes(30))) {
//             return mapper.toResponse(assignment);
//         }

//         List<SupportPersonnelCapacity> active = capacityRepo.findByActiveTrue();
//         Long currentPersonId = assignment.getSupportPersonId();
//         String previousName  = assignment.getSupportPersonName();

//         SupportPersonnelCapacity next = selectNextPerson(active, currentPersonId);

//         assignment.setSupportPersonId(next.getSupportPersonId());
//         assignment.setSupportPersonName(next.getSupportPersonName());
//         assignment.setRemainingHours(null);
//         assignment.setStatus(AssignmentConstants.STATUS_REASSIGNED);
//         assignment.setAssignedAt(LocalDateTime.now());
//         assignment.setReassigned(true);
//         ticketRepo.save(assignment);

//         String managerEmail = resolveUserEmail(itsmManagerUserId);
//         if (managerEmail != null) {
//             sendEmail(managerEmail,
//                 "Ticket Not Acknowledged — Escalation #" + ticketId,
//                 previousName + " did not acknowledge ticket #" + ticketId
//                 + " within 30 minutes. The ticket has been reassigned to "
//                 + next.getSupportPersonName() + ".");
//         }

//         String newEmail = resolveUserEmail(next.getSupportPersonId());
//         if (newEmail != null) {
//             sendEmail(newEmail,
//                 "Ticket Reassigned to You — #" + ticketId,
//                 "Ticket #" + ticketId + " has been reassigned to you ("
//                 + next.getSupportPersonName() + "). "
//                 + "Please acknowledge within 30 minutes via the Support Dashboard.");
//         }

//         return mapper.toResponse(assignment);
//     }

//     @Override
//     @Transactional(readOnly = true)
//     public AssignmentResponse getAssignment(Long ticketId) {
//         return mapper.toResponse(ticketRepo.findByTicketId(ticketId)
//                 .orElseThrow(() -> new ResourceNotFoundException(AssignmentConstants.TICKET_NOT_FOUND + ticketId)));
//     }

//     @Override
//     @Transactional(readOnly = true)
//     public List<AssignmentResponse> getAssignmentsBySupportPerson(Long supportPersonId) {
//         return ticketRepo.findBySupportPersonId(supportPersonId)
//                 .stream().map(mapper::toResponse).collect(Collectors.toList());
//     }

//     // ── Helpers ──────────────────────────────────────────────────────────────

//     private void sendEmail(String to, String subject, String body) {
//         try {
//             mailClient.sendEmail(new EmailRequest(to, subject, body, false));
//             log.info("Email sent to {}", to);
//         } catch (Exception ex) {
//             log.warn("Email send failed to {}: {}", to, ex.getMessage());
//         }
//     }

//     @SuppressWarnings("unchecked")
//     private String resolveUserEmail(Long userId) {
//         if (userId == null || userId <= 0) return null;
//         try {
//             Map<String, Object> body = masterDataClient.getUserById(userId);
//             if (body != null && body.get("data") instanceof Map) {
//                 Map<String, Object> data = (Map<String, Object>) body.get("data");
//                 Object email = data.get("email");
//                 if (email instanceof String s && !s.isBlank() && !s.contains("@itsm.com")) {
//                     return s;
//                 }
//             }
//         } catch (Exception ex) {
//             log.warn("Could not resolve email for userId={}: {}", userId, ex.getMessage());
//         }
//         return null;
//     }

//     @SuppressWarnings("unchecked")
//     private String resolveRequesterEmail(Long ticketId) {
//         if (ticketId == null) return null;
//         try {
//             Map<String, Object> body = ticketClient.getTicketById(ticketId);
//             if (body != null && body.get("data") instanceof Map) {
//                 Map<String, Object> data = (Map<String, Object>) body.get("data");
//                 Object userId = data.get("requestedById");
//                 if (userId != null) return resolveUserEmail(Long.parseLong(userId.toString()));
//             }
//         } catch (Exception ex) {
//             log.warn("Could not resolve requester email for ticketId={}: {}", ticketId, ex.getMessage());
//         }
//         return null;
//     }

    
//     @Override
//     public void addSupportPersonnelCapacity(Long userId, String fullName) {
//         // Avoid duplicates — check if already in the capacity table
//         boolean exists = capacityRepo.findByActiveTrue()
//                 .stream()
//                 .anyMatch(c -> c.getSupportPersonId().equals(userId));

//         if (exists) {
//             log.info("Capacity entry already exists for userId={}, skipping", userId);
//             return;
//         }

//         SupportPersonnelCapacity cap = new SupportPersonnelCapacity();
//         cap.setSupportPersonId(userId);
//         cap.setSupportPersonName(fullName != null && !fullName.isBlank() ? fullName : "Support Personnel");
//         cap.setServiceType("IT");          // default service type
//         cap.setActive(true);
//         cap.setTotalResponseTimeHours(8.0);
//         cap.setTotalEstimatedHours(40.0);
//         capacityRepo.save(cap);

//         log.info("Added support personnel capacity entry for userId={}, name={}", userId, fullName);
//     }

// }


package com.rvz.assignmentservice.service.impl;

import com.rvz.assignmentservice.client.MailClient;
import com.rvz.assignmentservice.client.MasterDataClient;
import com.rvz.assignmentservice.client.TicketClient;
import com.rvz.assignmentservice.config.AssignmentConstants;
import com.rvz.assignmentservice.config.AssignmentMapper;
import com.rvz.assignmentservice.dto.request.AcknowledgeRequest;
import com.rvz.assignmentservice.dto.request.EmailRequest;
import com.rvz.assignmentservice.dto.request.TriggerAssignmentRequest;
import com.rvz.assignmentservice.dto.response.AssignmentResponse;
import com.rvz.assignmentservice.entity.SupportPersonnelCapacity;
import com.rvz.assignmentservice.entity.TicketAssignment;
import com.rvz.assignmentservice.exception.AssignmentException;
import com.rvz.assignmentservice.exception.ResourceNotFoundException;
import com.rvz.assignmentservice.repository.SupportPersonnelCapacityRepository;
import com.rvz.assignmentservice.repository.TicketAssignmentRepository;
import com.rvz.assignmentservice.service.AssignmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private static final Logger log = LoggerFactory.getLogger(AssignmentServiceImpl.class);

    private final TicketAssignmentRepository          ticketRepo;
    private final SupportPersonnelCapacityRepository  capacityRepo;
    private final AssignmentMapper                    mapper;
    private final MailClient                          mailClient;
    private final MasterDataClient                    masterDataClient;
    private final TicketClient                        ticketClient;

    @Value("${itsm.manager.user.id:0}")
    private Long itsmManagerUserId;

    public AssignmentServiceImpl(TicketAssignmentRepository ticketRepo,
                                  SupportPersonnelCapacityRepository capacityRepo,
                                  AssignmentMapper mapper,
                                  MailClient mailClient,
                                  MasterDataClient masterDataClient,
                                  TicketClient ticketClient) {
        this.ticketRepo       = ticketRepo;
        this.capacityRepo     = capacityRepo;
        this.mapper           = mapper;
        this.mailClient       = mailClient;
        this.masterDataClient = masterDataClient;
        this.ticketClient     = ticketClient;
    }

    // ── Round-Robin selection ────────────────────────────────────────────────
    private SupportPersonnelCapacity selectNextPerson(
            List<SupportPersonnelCapacity> activePersonnel,
            Long excludePersonId) {

        List<TicketAssignment> allActive = ticketRepo.findAll().stream()
                .filter(a -> AssignmentConstants.STATUS_ASSIGNED.equals(a.getStatus())
                          || AssignmentConstants.STATUS_OPEN.equals(a.getStatus()))
                .collect(Collectors.toList());

        Map<Long, Long> countMap = allActive.stream()
                .collect(Collectors.groupingBy(TicketAssignment::getSupportPersonId, Collectors.counting()));

        Map<Long, LocalDateTime> lastAssigned = ticketRepo.findAll().stream()
                .filter(a -> a.getAssignedAt() != null)
                .collect(Collectors.toMap(
                        TicketAssignment::getSupportPersonId,
                        TicketAssignment::getAssignedAt,
                        (existing, replacement) -> replacement.isAfter(existing) ? replacement : existing
                ));

        return activePersonnel.stream()
                .filter(p -> excludePersonId == null || !p.getSupportPersonId().equals(excludePersonId))
                .min(Comparator
                        .comparingLong((SupportPersonnelCapacity p) ->
                                countMap.getOrDefault(p.getSupportPersonId(), 0L))
                        .thenComparing(p -> lastAssigned.getOrDefault(
                                p.getSupportPersonId(),
                                LocalDateTime.MIN))
                )
                .orElseThrow(() -> new AssignmentException("No eligible support personnel found"));
    }

    // ── triggerAssignment ────────────────────────────────────────────────────
    @Override
    public AssignmentResponse triggerAssignment(TriggerAssignmentRequest request) {
        log.info("Triggering assignment for ticketId={}", request.getTicketId());

        List<SupportPersonnelCapacity> active = capacityRepo.findByActiveTrue();
        if (active.isEmpty()) {
            throw new AssignmentException("No active support personnel available");
        }

        SupportPersonnelCapacity selected;

        if (request.getSupportPersonId() != null) {
            selected = active.stream()
                    .filter(p -> p.getSupportPersonId().equals(request.getSupportPersonId()))
                    .findFirst()
                    .orElseThrow(() -> new AssignmentException(
                            "Support person " + request.getSupportPersonId() + " not found or inactive"));
            log.info("Manual assignment: ticketId={} → personId={} ({})",
                    request.getTicketId(), selected.getSupportPersonId(), selected.getSupportPersonName());
        } else {
            selected = selectNextPerson(active, null);
            log.info("Auto round-robin: ticketId={} → personId={} ({})",
                    request.getTicketId(), selected.getSupportPersonId(), selected.getSupportPersonName());
        }

        TicketAssignment assignment = ticketRepo.findByTicketId(request.getTicketId())
                .orElse(new TicketAssignment());

        assignment.setTicketId(request.getTicketId());
        assignment.setSupportPersonId(selected.getSupportPersonId());
        assignment.setSupportPersonName(selected.getSupportPersonName());
        assignment.setPriority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM");
        assignment.setEstimatedHours(request.getEstimatedHours());
        assignment.setResponseTimeHours(request.getResponseTimeHours());
        assignment.setRemainingHours(null);
        assignment.setStatus(AssignmentConstants.STATUS_ASSIGNED);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setReassigned(false);

        TicketAssignment saved = ticketRepo.save(assignment);

        String email = resolveUserEmail(selected.getSupportPersonId());
        if (email != null) {
            sendEmail(email,
                "Ticket Assigned — #" + request.getTicketId(),
                "Ticket #" + request.getTicketId() + " has been assigned to you ("
                + selected.getSupportPersonName() + ").\n"
                + "Please acknowledge within 30 minutes via the Support Dashboard.");
        }

        return mapper.toResponse(saved);
    }

    // ── acknowledgeTicket ────────────────────────────────────────────────────
    // @Override
    // public AssignmentResponse acknowledgeTicket(AcknowledgeRequest request) {
    //     TicketAssignment assignment = ticketRepo.findByTicketId(request.getTicketId())
    //             .orElseThrow(() -> new ResourceNotFoundException(
    //                     AssignmentConstants.TICKET_NOT_FOUND + request.getTicketId()));

    //     if (!assignment.getSupportPersonId().equals(request.getSupportPersonId())) {
    //         throw new AssignmentException("Only the assigned support person can acknowledge this ticket");
    //     }

    //     assignment.setStatus(AssignmentConstants.STATUS_OPEN);
    //     assignment.setAcknowledgedAt(LocalDateTime.now());
    //     TicketAssignment saved = ticketRepo.save(assignment);

    //     // ── FIX: ensure ticket-service has the assignee set on acknowledge ──
    //     updateTicketAssignee(assignment.getTicketId(),
    //             assignment.getSupportPersonId(), assignment.getSupportPersonName());

    //     String requesterEmail = resolveRequesterEmail(request.getTicketId());
    //     if (requesterEmail != null) {
    //         sendEmail(requesterEmail,
    //             "Ticket #" + assignment.getTicketId() + " — Assigned and In Progress",
    //             "Your IT service ticket #" + assignment.getTicketId()
    //             + " has been assigned to " + assignment.getSupportPersonName()
    //             + " and is now in progress.");
    //     }

    //     return mapper.toResponse(saved);
    // }

    @Override
@Transactional
public AssignmentResponse acknowledgeTicket(AcknowledgeRequest request) {
    TicketAssignment assignment = ticketRepo.findByTicketId(request.getTicketId())
            .orElseThrow(() -> new ResourceNotFoundException(
                    AssignmentConstants.TICKET_NOT_FOUND + request.getTicketId()));
 
    if (!assignment.getSupportPersonId().equals(request.getSupportPersonId())) {
        throw new AssignmentException("Only the assigned support person can acknowledge this ticket");
    }
 
    assignment.setStatus(AssignmentConstants.STATUS_OPEN);
    assignment.setAcknowledgedAt(LocalDateTime.now());
    TicketAssignment saved = ticketRepo.save(assignment);
 
    // This now throws if ticket-service is down — transaction rolls back
    updateTicketAssignee(assignment.getTicketId(),
            assignment.getSupportPersonId(), assignment.getSupportPersonName());
 
    // email (keep non-fatal)
    String requesterEmail = resolveRequesterEmail(request.getTicketId());
    if (requesterEmail != null) {
        try {
            sendEmail(requesterEmail,
                "Ticket #" + assignment.getTicketId() + " — Assigned and In Progress",
                "Your IT service ticket #" + assignment.getTicketId()
                + " has been assigned to " + assignment.getSupportPersonName()
                + " and is now in progress.");
        } catch (Exception e) {
            log.warn("Email failed: {}", e.getMessage());
        }
    }
 
    return mapper.toResponse(saved);
}

    // ── checkAndReassignIfTimeout ────────────────────────────────────────────
    @Override
    public AssignmentResponse checkAndReassignIfTimeout(Long ticketId) {
        TicketAssignment assignment = ticketRepo.findByTicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(AssignmentConstants.TICKET_NOT_FOUND + ticketId));

        if (assignment.getAcknowledgedAt() != null ||
            !AssignmentConstants.STATUS_ASSIGNED.equals(assignment.getStatus())) {
            return mapper.toResponse(assignment);
        }

        if (!LocalDateTime.now().isAfter(assignment.getAssignedAt().plusMinutes(30))) {
            return mapper.toResponse(assignment);
        }

        List<SupportPersonnelCapacity> active = capacityRepo.findByActiveTrue();
        Long currentPersonId = assignment.getSupportPersonId();
        String previousName  = assignment.getSupportPersonName();

        SupportPersonnelCapacity next = selectNextPerson(active, currentPersonId);

        assignment.setSupportPersonId(next.getSupportPersonId());
        assignment.setSupportPersonName(next.getSupportPersonName());
        assignment.setRemainingHours(null);
        assignment.setStatus(AssignmentConstants.STATUS_REASSIGNED);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setReassigned(true);
        ticketRepo.save(assignment);

        // ── FIX: update ticket-service with new assignee after reassignment ──
        updateTicketAssignee(ticketId, next.getSupportPersonId(), next.getSupportPersonName());

        String managerEmail = resolveUserEmail(itsmManagerUserId);
        if (managerEmail != null) {
            sendEmail(managerEmail,
                "Ticket Not Acknowledged — Escalation #" + ticketId,
                previousName + " did not acknowledge ticket #" + ticketId
                + " within 30 minutes. The ticket has been reassigned to "
                + next.getSupportPersonName() + ".");
        }

        String newEmail = resolveUserEmail(next.getSupportPersonId());
        if (newEmail != null) {
            sendEmail(newEmail,
                "Ticket Reassigned to You — #" + ticketId,
                "Ticket #" + ticketId + " has been reassigned to you ("
                + next.getSupportPersonName() + "). "
                + "Please acknowledge within 30 minutes via the Support Dashboard.");
        }

        return mapper.toResponse(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignment(Long ticketId) {
        return mapper.toResponse(ticketRepo.findByTicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(AssignmentConstants.TICKET_NOT_FOUND + ticketId)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsBySupportPerson(Long supportPersonId) {
        return ticketRepo.findBySupportPersonId(supportPersonId)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    // ── NEW: add support personnel capacity on role assignment ───────────────
    @Override
    public void addSupportPersonnelCapacity(Long userId, String fullName) {
        // Avoid duplicates
        boolean exists = capacityRepo.findByActiveTrue()
                .stream()
                .anyMatch(c -> c.getSupportPersonId().equals(userId));

        if (exists) {
            log.info("Capacity entry already exists for userId={}, skipping", userId);
            return;
        }

        SupportPersonnelCapacity cap = new SupportPersonnelCapacity();
        cap.setSupportPersonId(userId);
        cap.setSupportPersonName(fullName != null && !fullName.isBlank() ? fullName : "Support Personnel");
        cap.setServiceType("IT");
        cap.setActive(true);
        cap.setTotalResponseTimeHours(0.0);  // starts at 0 — no tickets assigned yet
        cap.setTotalEstimatedHours(0.0);      // updated as tickets come in
        capacityRepo.save(cap);

        log.info("Added support personnel capacity for userId={}, name={}", userId, fullName);
    }
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAssignments() {
        return ticketRepo.findAll().stream().map(a -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("assignmentId",      a.getAssignmentId());
            m.put("ticketId",          a.getTicketId());
            m.put("supportPersonId",   a.getSupportPersonId());
            m.put("supportPersonName", a.getSupportPersonName());
            m.put("status",            a.getStatus());
            m.put("assignedAt",        a.getAssignedAt());
            m.put("acknowledgedAt",    a.getAcknowledgedAt());
            m.put("priority",          a.getPriority());
            m.put("reassigned",        a.getReassigned());
            return m;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByStatus(String status) {
        return ticketRepo.findByStatus(status.toUpperCase())
                .stream()
                .map(mapper::toResponse)
                .toList();
    }


    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Calls PUT /api/tickets/{ticketId}/assign on ticket-service so that
     * assignee_id and assignee_name are stored in the ticket table.
     * Non-fatal — logs a warning on failure.
     */
    // private void updateTicketAssignee(Long ticketId, Long assigneeId, String assigneeName) {
    //     try {
    //         Map<String, Object> body = new HashMap<>();
    //         body.put("assigneeId",   assigneeId);
    //         body.put("assigneeName", assigneeName != null ? assigneeName : "");
    //         ticketClient.assignTicket(ticketId, body);
    //         log.info("Ticket #{} assignee updated in ticket-service: {} (id={})",
    //                 ticketId, assigneeName, assigneeId);
    //     } catch (Exception ex) {
    //         log.warn("Could not update assignee in ticket-service for ticketId={}: {}",
    //                 ticketId, ex.getMessage());
    //     }
    // }
    private void updateTicketAssignee(Long ticketId, Long assigneeId, String assigneeName) {
    Map<String, Object> body = new HashMap<>();
    body.put("assigneeId",   assigneeId);
    body.put("assigneeName", assigneeName != null ? assigneeName : "");
    ticketClient.assignTicket(ticketId, body);   // throws FeignException on failure
    log.info("Ticket #{} assignee updated in ticket-service: {} (id={})",
            ticketId, assigneeName, assigneeId);
}
    private void sendEmail(String to, String subject, String body) {
        try {
            mailClient.sendEmail(new EmailRequest(to, subject, body, false));
            log.info("Email sent to {}", to);
        } catch (Exception ex) {
            log.warn("Email send failed to {}: {}", to, ex.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String resolveUserEmail(Long userId) {
        if (userId == null || userId <= 0) return null;
        try {
            Map<String, Object> body = masterDataClient.getUserById(userId);
            if (body != null && body.get("data") instanceof Map) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                Object email = data.get("email");
                if (email instanceof String s && !s.isBlank() && !s.contains("@itsm.com")) {
                    return s;
                }
            }
        } catch (Exception ex) {
            log.warn("Could not resolve email for userId={}: {}", userId, ex.getMessage());
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String resolveRequesterEmail(Long ticketId) {
        if (ticketId == null) return null;
        try {
            Map<String, Object> body = ticketClient.getTicketById(ticketId);
            if (body != null && body.get("data") instanceof Map) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                Object userId = data.get("requestedById");
                if (userId != null) return resolveUserEmail(Long.parseLong(userId.toString()));
            }
        } catch (Exception ex) {
            log.warn("Could not resolve requester email for ticketId={}: {}", ticketId, ex.getMessage());
        }
        return null;
    }
}
