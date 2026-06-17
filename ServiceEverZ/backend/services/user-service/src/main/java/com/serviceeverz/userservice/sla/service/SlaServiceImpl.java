// src/main/java/com/serviceeverz/userservice/sla/service/SlaServiceImpl.java
package com.serviceeverz.userservice.sla.service;
 
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.serviceeverz.userservice.shared.exception.BusinessException;
import com.serviceeverz.userservice.shared.exception.ResourceNotFoundException;
import com.serviceeverz.userservice.sla.client.SlaMailClient;
import com.serviceeverz.userservice.sla.dto.SlaDashboardResponse;
import com.serviceeverz.userservice.sla.dto.SlaEscalationLevelRequest;
import com.serviceeverz.userservice.sla.dto.SlaEscalationLevelResponse;
import com.serviceeverz.userservice.sla.dto.SlaEvaluationRequest;
import com.serviceeverz.userservice.sla.dto.SlaEvaluationResponse;
import com.serviceeverz.userservice.sla.dto.SlaPolicyRequest;
import com.serviceeverz.userservice.sla.dto.SlaPolicyResponse;
import com.serviceeverz.userservice.sla.entity.SlaEscalationLevel;
import com.serviceeverz.userservice.sla.entity.SlaEvaluation;
import com.serviceeverz.userservice.sla.entity.SlaPolicy;
import com.serviceeverz.userservice.sla.enums.SlaStatus;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import com.serviceeverz.userservice.sla.enums.TicketStatus;
import com.serviceeverz.userservice.sla.repository.SlaEscalationLevelRepository;
import com.serviceeverz.userservice.sla.repository.SlaEvaluationRepository;
import com.serviceeverz.userservice.sla.repository.SlaPolicyRepository;
 
@Service
public class SlaServiceImpl implements ISlaService {
 
    private static final Logger log = LoggerFactory.getLogger(SlaServiceImpl.class);
 
    private final SlaPolicyRepository          policyRepo;
    private final SlaEvaluationRepository      evalRepo;
    private final SlaEscalationLevelRepository escalationRepo;
    // ── NEW: mail client for breach notifications ─────────────────────────────
    private final SlaMailClient                mailClient;
 
    public SlaServiceImpl(SlaPolicyRepository policyRepo,
                          SlaEvaluationRepository evalRepo,
                          SlaEscalationLevelRepository escalationRepo,
                          SlaMailClient mailClient) {
        this.policyRepo     = policyRepo;
        this.evalRepo       = evalRepo;
        this.escalationRepo = escalationRepo;
        this.mailClient     = mailClient;
    }
 
    // ── Policy CRUD (UNCHANGED) ───────────────────────────────────────────────
 
    @Override
    @Transactional
    public SlaPolicyResponse createOrUpdatePolicy(SlaPolicyRequest req) {
        int respMins   = req.resolvedResponseMinutes();
        int resoMins   = req.resolvedResolutionMinutes();
        int breachMins = req.resolvedBreachMinutes();
 
        if (respMins >= resoMins)
            throw new BusinessException("Response time must be less than resolution time for priority " + req.getPriority());
        if (breachMins < 0)
            throw new BusinessException("Breach time cannot be negative.");
 
        SlaPolicy policy = policyRepo.findByPriority(req.getPriority()).orElse(new SlaPolicy());
        policy.setPriority(req.getPriority());
        policy.setResponseTimeMinutes(respMins);
        policy.setResolutionTimeMinutes(resoMins);
        policy.setBreachTimeMinutes(breachMins);
        policy.setActive(req.isActive());
        policy.setDescription(req.getDescription());
        return SlaPolicyResponse.from(policyRepo.save(policy));
    }
 
    @Override
    public SlaPolicyResponse getPolicyByPriority(TicketPriority priority) {
        return policyRepo.findByPriority(priority)
                         .map(SlaPolicyResponse::from)
                         .orElseThrow(() -> new ResourceNotFoundException("No SLA policy for priority: " + priority));
    }
 
    @Override
    public List<SlaPolicyResponse> getAllPolicies() {
        return policyRepo.findAll().stream()
                         .sorted(Comparator.comparing(SlaPolicy::getPriority))
                         .map(SlaPolicyResponse::from)
                         .collect(Collectors.toList());
    }
 
    @Override
    @Transactional
    public void deletePolicy(Long id) {
        SlaPolicy policy = policyRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SLA policy not found: " + id));
 
        long activeCount = evalRepo.findAll().stream()
            .filter(e -> e.getPriority() == policy.getPriority()
                      && e.getTicketStatus() != TicketStatus.CLOSED)
            .count();
 
        if (activeCount > 0)
            throw new BusinessException("Cannot delete the " + policy.getPriority().name()
                + " SLA policy — " + activeCount + " active ticket(s) are using it.");
 
        policyRepo.deleteById(id);
    }
 
    // ── Ticket lifecycle (UNCHANGED) ──────────────────────────────────────────
 
    @Override
    @Transactional
    public SlaEvaluationResponse registerTicket(SlaEvaluationRequest req) {
        if (evalRepo.findByTicketId(req.getTicketId()).isPresent())
            throw new BusinessException("Ticket " + req.getTicketId() + " already has an SLA evaluation.");
 
        SlaPolicy policy = policyRepo.findByPriority(req.getPriority())
                                     .orElseThrow(() -> new BusinessException(
                                         "No SLA policy for priority: " + req.getPriority() + ". Configure SLA policies first."));
 
        SlaEvaluation eval = new SlaEvaluation();
        eval.setTicketId(req.getTicketId());
        eval.setTicketNumber(req.getTicketNumber());
        eval.setSubject(req.getSubject());
        eval.setRaisedByUserId(req.getRaisedByUserId());
        eval.setRaisedByName(req.getRaisedByName());
        eval.setPriority(req.getPriority());
        eval.setTicketCreatedAt(req.getTicketCreatedAt());
        eval.setFirstResponseAt(req.getFirstResponseAt());
        eval.setTicketStatus(req.getTicketStatus() != null ? req.getTicketStatus() : TicketStatus.OPEN);
 
        LocalDateTime base = req.getTicketCreatedAt();
        eval.setResponseDeadline(base.plusMinutes(policy.getResponseTimeMinutes()));
        eval.setResolutionDeadline(base.plusMinutes(policy.getResolutionTimeMinutes()));
 
        computeAndSetStatus(eval, policy);
        return SlaEvaluationResponse.from(evalRepo.save(eval));
    }
 
    @Override
    @Transactional
    public SlaEvaluationResponse updateTicketSla(Long ticketId, SlaEvaluationRequest req) {
        SlaEvaluation eval = findEval(ticketId);
        if (req.getFirstResponseAt() != null) eval.setFirstResponseAt(req.getFirstResponseAt());
        if (req.getResolvedAt()      != null) eval.setResolvedAt(req.getResolvedAt());
        if (req.getSubject()         != null) eval.setSubject(req.getSubject());
        if (req.getTicketStatus()    != null) applyStatusTransition(eval, req.getTicketStatus());
        SlaPolicy policy = policyRepo.findByPriority(eval.getPriority()).orElse(null);
        computeAndSetStatus(eval, policy);
        return SlaEvaluationResponse.from(evalRepo.save(eval));
    }
 
    @Override
    @Transactional
    public SlaEvaluationResponse holdTicket(Long ticketId) {
        SlaEvaluation eval = findEval(ticketId);
        if (eval.isOnHold()) throw new BusinessException("Ticket " + ticketId + " is already on hold.");
        if (eval.getTicketStatus() == TicketStatus.RESOLVED || eval.getTicketStatus() == TicketStatus.CLOSED)
            throw new BusinessException("Cannot hold a resolved or closed ticket.");
        eval.setOnHold(true);
        eval.setPausedAt(LocalDateTime.now());
        eval.setTicketStatus(TicketStatus.ON_HOLD);
        SlaPolicy policy = policyRepo.findByPriority(eval.getPriority()).orElse(null);
        computeAndSetStatus(eval, policy);
        return SlaEvaluationResponse.from(evalRepo.save(eval));
    }
 
    @Override
    @Transactional
    public SlaEvaluationResponse resumeTicket(Long ticketId) {
        SlaEvaluation eval = findEval(ticketId);
        if (!eval.isOnHold()) throw new BusinessException("Ticket " + ticketId + " is not on hold.");
        LocalDateTime now = LocalDateTime.now();
        if (eval.getPausedAt() != null) {
            long pausedMins = Duration.between(eval.getPausedAt(), now).toMinutes();
            eval.setTotalPausedMinutes(eval.getTotalPausedMinutes() + pausedMins);
            eval.setResponseDeadline(eval.getResponseDeadline().plusMinutes(pausedMins));
            eval.setResolutionDeadline(eval.getResolutionDeadline().plusMinutes(pausedMins));
        }
        eval.setOnHold(false);
        eval.setResumedAt(now);
        eval.setPausedAt(null);
        eval.setTicketStatus(TicketStatus.IN_PROGRESS);
        SlaPolicy policy = policyRepo.findByPriority(eval.getPriority()).orElse(null);
        computeAndSetStatus(eval, policy);
        return SlaEvaluationResponse.from(evalRepo.save(eval));
    }
 
    @Override
    @Transactional
    public SlaEvaluationResponse resolveTicket(Long ticketId) {
        SlaEvaluation eval = findEval(ticketId);
        if (eval.getTicketStatus() == TicketStatus.RESOLVED || eval.getTicketStatus() == TicketStatus.CLOSED)
            throw new BusinessException("Ticket is already resolved or closed.");
        LocalDateTime now = LocalDateTime.now();
        if (eval.isOnHold() && eval.getPausedAt() != null) {
            long pausedMins = Duration.between(eval.getPausedAt(), now).toMinutes();
            eval.setTotalPausedMinutes(eval.getTotalPausedMinutes() + pausedMins);
            eval.setOnHold(false);
            eval.setPausedAt(null);
        }
        eval.setClosureTime(now);
        eval.setResolvedAt(now);
        eval.setTicketStatus(TicketStatus.RESOLVED);
        SlaPolicy policy = policyRepo.findByPriority(eval.getPriority()).orElse(null);
        computeAndSetStatus(eval, policy);
        return SlaEvaluationResponse.from(evalRepo.save(eval));
    }
 
    @Override
    @Transactional
    public SlaEvaluationResponse closeTicket(Long ticketId) {
        SlaEvaluation eval = findEval(ticketId);
        eval.setResolvedAt(LocalDateTime.now());
        eval.setTicketStatus(TicketStatus.CLOSED);
        if (eval.getClosureTime() == null) eval.setClosureTime(LocalDateTime.now());
        SlaPolicy policy = policyRepo.findByPriority(eval.getPriority()).orElse(null);
        computeAndSetStatus(eval, policy);
        return SlaEvaluationResponse.from(evalRepo.save(eval));
    }
 
    @Override
    @Transactional
    public SlaEvaluationResponse changeTicketStatus(Long ticketId, TicketStatus newStatus) {
        return switch (newStatus) {
            case ON_HOLD             -> holdTicket(ticketId);
            case IN_PROGRESS, OPEN  -> resumeTicket(ticketId);
            case RESOLVED            -> resolveTicket(ticketId);
            case CLOSED              -> closeTicket(ticketId);
        };
    }
 
    @Override
    public SlaEvaluationResponse getEvaluationByTicketId(Long ticketId) {
        return SlaEvaluationResponse.from(findEval(ticketId));
    }
 
     @Override
    public List<SlaEvaluationResponse> getAllEvaluations() {
        return evalRepo.findAll().stream()
                       .sorted(Comparator.comparing(SlaEvaluation::getResolutionDeadline))
                       .map(SlaEvaluationResponse::from)
                       .collect(Collectors.toList());
    }
 
    // ── Dashboard (UNCHANGED) ─────────────────────────────────────────────────
 
    @Override
    public SlaDashboardResponse getDashboard() {
        long total    = evalRepo.count();
        long onTrack  = evalRepo.countBySlaStatus(SlaStatus.ON_TRACK);
        long atRisk   = evalRepo.countBySlaStatus(SlaStatus.AT_RISK);
        long breached = evalRepo.countBySlaStatus(SlaStatus.BREACHED);
        long met      = evalRepo.countBySlaStatus(SlaStatus.MET);
 
        double compliance = total > 0 ? Math.round((double) met / total * 10000.0) / 100.0 : 100.0;
        double breachRate = total > 0 ? Math.round((double) breached / total * 10000.0) / 100.0 : 0.0;
 
        Map<String, Long> breachByPriority = new LinkedHashMap<>();
        for (TicketPriority p : TicketPriority.values()) breachByPriority.put(p.name(), 0L);
        for (Object[] row : evalRepo.countBreachByPriority())
            breachByPriority.put(((TicketPriority) row[0]).name(), (Long) row[1]);
 
        List<SlaEvaluationResponse> recentBreaches = evalRepo
            .findRecentBreaches(PageRequest.of(0, 10)).stream()
            .map(SlaEvaluationResponse::from).collect(Collectors.toList());
 
        List<SlaEvaluationResponse> atRiskTickets = evalRepo
            .findAtRiskTickets(PageRequest.of(0, 10)).stream()
            .map(SlaEvaluationResponse::from).collect(Collectors.toList());
 
        SlaDashboardResponse dash = new SlaDashboardResponse();
        dash.setTotalEvaluations(total);
        dash.setOnTrackCount(onTrack);
        dash.setAtRiskCount(atRisk);
        dash.setBreachedCount(breached);
        dash.setMetCount(met);
        dash.setComplianceRate(compliance);
        dash.setBreachRate(breachRate);
        dash.setBreachByPriority(breachByPriority);
        dash.setRecentBreaches(recentBreaches);
        dash.setAtRiskTickets(atRiskTickets);
        return dash;
    }
 
    @Override
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void refreshAllStatuses() {
        List<SlaEvaluation> open = evalRepo.findAll().stream()
            .filter(e -> e.getSlaStatus() != SlaStatus.MET
                      && e.getTicketStatus() != TicketStatus.CLOSED)
            .collect(Collectors.toList());
 
        for (SlaEvaluation e : open) {
            SlaPolicy policy = policyRepo.findByPriority(e.getPriority()).orElse(null);
            computeAndSetStatus(e, policy);
            if (e.getSlaStatus() == SlaStatus.BREACHED && e.getEscalationLevel() == 0) {
                triggerEscalation(e, 1);
            }
        }
        evalRepo.saveAll(open);
    }
 
    // ── Escalation config (UNCHANGED) ─────────────────────────────────────────
 
    @Override
    @Transactional
    public SlaEscalationLevelResponse saveEscalationLevel(SlaEscalationLevelRequest req) {
        SlaEscalationLevel esc = escalationRepo
            .findByPriorityAndEscalationLevel(req.getPriority(), req.getEscalationLevel())
            .orElse(new SlaEscalationLevel());
        esc.setPriority(req.getPriority());
        esc.setEscalationLevel(req.getEscalationLevel());
        esc.setUserId(req.getUserId());
        esc.setUserName(req.getUserName());
        esc.setUserEmail(req.getUserEmail());
        esc.setRole(req.getRole());
        return SlaEscalationLevelResponse.from(escalationRepo.save(esc));
    }
 
    @Override
    public List<SlaEscalationLevelResponse> getAllEscalationLevels() {
        return escalationRepo.findAllByOrderByPriorityAscEscalationLevelAsc()
                             .stream().map(SlaEscalationLevelResponse::from)
                             .collect(Collectors.toList());
    }
 
    @Override
    public List<SlaEscalationLevelResponse> getEscalationLevelsByPriority(TicketPriority priority) {
        return escalationRepo.findByPriorityOrderByEscalationLevelAsc(priority)
                             .stream().map(SlaEscalationLevelResponse::from)
                             .collect(Collectors.toList());
    }
 
    @Override
    @Transactional
    public void deleteEscalationLevel(Long id) {
        if (!escalationRepo.existsById(id))
            throw new ResourceNotFoundException("Escalation level not found: " + id);
        escalationRepo.deleteById(id);
    }
   // ── Private helpers ───────────────────────────────────────────────────────
 
    private SlaEvaluation findEval(Long ticketId) {
        return evalRepo.findByTicketId(ticketId)
                       .orElseThrow(() -> new ResourceNotFoundException("No SLA evaluation for ticket: " + ticketId));
    }
 
    private void applyStatusTransition(SlaEvaluation eval, TicketStatus newStatus) {
        LocalDateTime now = LocalDateTime.now();
        if (newStatus == TicketStatus.ON_HOLD && !eval.isOnHold()) {
            eval.setOnHold(true);
            eval.setPausedAt(now);
        } else if ((newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.OPEN) && eval.isOnHold()) {
            if (eval.getPausedAt() != null) {
                long mins = Duration.between(eval.getPausedAt(), now).toMinutes();
                eval.setTotalPausedMinutes(eval.getTotalPausedMinutes() + mins);
                eval.setResponseDeadline(eval.getResponseDeadline().plusMinutes(mins));
                eval.setResolutionDeadline(eval.getResolutionDeadline().plusMinutes(mins));
            }
            eval.setOnHold(false);
            eval.setResumedAt(now);
            eval.setPausedAt(null);
        } else if (newStatus == TicketStatus.RESOLVED && eval.getClosureTime() == null) {
            eval.setClosureTime(now);
            eval.setResolvedAt(now);
        }
        eval.setTicketStatus(newStatus);
    }
 
    private void computeAndSetStatus(SlaEvaluation eval, SlaPolicy policy) {
        if (eval.isOnHold()) return;
 
        LocalDateTime effectiveNow = (eval.getClosureTime() != null)
            ? eval.getClosureTime() : LocalDateTime.now();
 
        boolean responseBreached   = eval.getFirstResponseAt() == null
                                     && effectiveNow.isAfter(eval.getResponseDeadline());
        boolean resolutionBreached = effectiveNow.isAfter(eval.getResolutionDeadline());
 
        eval.setResponseBreached(responseBreached);
        eval.setResolutionBreached(resolutionBreached);
 
        if (eval.getTicketStatus() == TicketStatus.RESOLVED || eval.getTicketStatus() == TicketStatus.CLOSED) {
            eval.setSlaStatus(!responseBreached && !resolutionBreached ? SlaStatus.MET : SlaStatus.BREACHED);
            if (eval.getSlaStatus() == SlaStatus.BREACHED && eval.getEscalationLevel() == 0)
                triggerEscalation(eval, 1);
            return;
        }
 
        if (resolutionBreached || responseBreached) {
            eval.setSlaStatus(SlaStatus.BREACHED);
            if (eval.getEscalationLevel() == 0) triggerEscalation(eval, 1);
            return;
        }
 
        long totalMins   = Duration.between(eval.getTicketCreatedAt(), eval.getResolutionDeadline()).toMinutes();
        long elapsedMins = Duration.between(eval.getTicketCreatedAt(), effectiveNow).toMinutes()
                           - eval.getTotalPausedMinutes();
        double usedPct   = totalMins > 0 ? (double) elapsedMins / totalMins : 0;
        eval.setSlaStatus(usedPct >= 0.8 ? SlaStatus.AT_RISK : SlaStatus.ON_TRACK);
    }
 
    /**
     * ── MODIFIED: triggerEscalation now sends a breach notification email.
     *
     * Flow:
     *  1. Look up the configured escalation contact for this priority + level
     *  2. Set escalation fields on the evaluation
     *  3. Send email to the escalation contact's email via mail-service
     *     — simple plain-text email, no ticket creation
     */
    private void triggerEscalation(SlaEvaluation eval, int targetLevel) {
        Optional<SlaEscalationLevel> escOpt = escalationRepo
            .findByPriorityAndEscalationLevel(eval.getPriority(), targetLevel);
 
        eval.setEscalationLevel(targetLevel);
        eval.setEscalatedAt(LocalDateTime.now());
 
        escOpt.ifPresent(esc -> {
            eval.setEscalatedToUserId(esc.getUserId());
            eval.setEscalatedToName(esc.getUserName());
 
            // ── NEW: send breach notification email ───────────────────────
            if (esc.getUserEmail() != null && !esc.getUserEmail().isBlank()) {
                sendBreachNotificationEmail(eval, esc);
            } else {
                log.warn("SLA breach: no email configured for escalation contact {} (priority={}, level={})",
                    esc.getUserName(), esc.getPriority(), esc.getEscalationLevel());
            }
        });
 
        if (escOpt.isEmpty()) {
            log.warn("SLA breach on ticket {} (priority={}) — no escalation contact configured for level {}",
                eval.getTicketNumber(), eval.getPriority(), targetLevel);
        }
    }
 
    /**
     * Sends a plain-text SLA breach email to the escalation contact.
     * Uses the same mail-service endpoint as email-ticket-service.
     * Failure is logged but does NOT block the SLA evaluation save.
     */
    private void sendBreachNotificationEmail(SlaEvaluation eval, SlaEscalationLevel esc) {
        try {
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");
 
            String subject = String.format("[SLA BREACH] Ticket %s — %s Priority",
                eval.getTicketNumber(),
                eval.getPriority().name());
 
            String body = String.format(
                "Dear %s,%n%n" +
                "This is an automated SLA breach notification from ServiceEverZ.%n%n" +
                "A ticket has breached its SLA and has been escalated to you (L%d).%n%n" +
                "--- Ticket Details ---%n" +
                "Ticket Number  : %s%n" +
                "Subject        : %s%n" +
                "Raised By      : %s%n" +
                "Priority       : %s%n" +
                "Ticket Status  : %s%n" +
                "Created At     : %s%n" +
                "Response DL    : %s%n" +
                "Resolution DL  : %s%n" +
                "Escalated At   : %s%n%n" +
                "Please take immediate action on this ticket.%n%n" +
                "— ServiceEverZ SLA Management",
 
                esc.getUserName(),
                esc.getEscalationLevel(),
                eval.getTicketNumber(),
                eval.getSubject() != null ? eval.getSubject() : "—",
                eval.getRaisedByName() != null ? eval.getRaisedByName() : "—",
                eval.getPriority().name(),
                eval.getTicketStatus().name(),
                eval.getTicketCreatedAt() != null ? eval.getTicketCreatedAt().format(dtf) : "—",
                eval.getResponseDeadline()   != null ? eval.getResponseDeadline().format(dtf)   : "—",
                eval.getResolutionDeadline() != null ? eval.getResolutionDeadline().format(dtf) : "—",
                LocalDateTime.now().format(dtf)
            );
 
            mailClient.sendEmail(
                new SlaMailClient.MailRequest(esc.getUserEmail(), subject, body, false)
            );
 
            log.info("SLA breach email sent to {} ({}) for ticket {}",
                esc.getUserName(), esc.getUserEmail(), eval.getTicketNumber());
 
        } catch (Exception ex) {
            // Never block the SLA evaluation save due to email failure
            log.warn("Failed to send SLA breach email to {} for ticket {}: {}",
                esc.getUserEmail(), eval.getTicketNumber(), ex.getMessage());
        }
    }
}
