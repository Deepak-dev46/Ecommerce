// src/main/java/com/serviceeverz/userservice/sla/service/ISlaService.java
package com.serviceeverz.userservice.sla.service;
 
import com.serviceeverz.userservice.sla.dto.*;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import com.serviceeverz.userservice.sla.enums.TicketStatus;
 
import java.util.List;
 
public interface ISlaService {
 
    // ── Policy CRUD ───────────────────────────────────────────────────────────
    SlaPolicyResponse createOrUpdatePolicy(SlaPolicyRequest request);
    SlaPolicyResponse getPolicyByPriority(TicketPriority priority);
    List<SlaPolicyResponse> getAllPolicies();
    void deletePolicy(Long id);
 
    // ── Ticket lifecycle ──────────────────────────────────────────────────────
    SlaEvaluationResponse registerTicket(SlaEvaluationRequest request);
    SlaEvaluationResponse updateTicketSla(Long ticketId, SlaEvaluationRequest request);
 
    /** PUT ticket ON HOLD — pauses SLA clock. */
    SlaEvaluationResponse holdTicket(Long ticketId);
 
    /** RESUME ticket from ON HOLD — accumulates paused minutes, restarts clock. */
    SlaEvaluationResponse resumeTicket(Long ticketId);
 
    /** Set RESOLVED — sets closureTime, stops clock, triggers final SLA evaluation. */
    SlaEvaluationResponse resolveTicket(Long ticketId);
 
    /** Set CLOSED — terminal state. */
    SlaEvaluationResponse closeTicket(Long ticketId);
 
    /** Change ticket status explicitly. */
    SlaEvaluationResponse changeTicketStatus(Long ticketId, TicketStatus newStatus);
 
    SlaEvaluationResponse getEvaluationByTicketId(Long ticketId);
    List<SlaEvaluationResponse> getAllEvaluations();
 
    // ── Dashboard ─────────────────────────────────────────────────────────────
    SlaDashboardResponse getDashboard();
    void refreshAllStatuses();
 
    // ── Escalation config ─────────────────────────────────────────────────────
    SlaEscalationLevelResponse saveEscalationLevel(SlaEscalationLevelRequest request);
    List<SlaEscalationLevelResponse> getAllEscalationLevels();
    List<SlaEscalationLevelResponse> getEscalationLevelsByPriority(TicketPriority priority);
    void deleteEscalationLevel(Long id);
}
 