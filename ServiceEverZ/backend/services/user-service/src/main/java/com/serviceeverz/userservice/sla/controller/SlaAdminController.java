// src/main/java/com/serviceeverz/userservice/sla/controller/SlaAdminController.java
package com.serviceeverz.userservice.sla.controller;
 
import com.serviceeverz.userservice.sla.dto.*;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import com.serviceeverz.userservice.sla.enums.TicketStatus;
import com.serviceeverz.userservice.sla.service.ISlaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
/**
 * SLA Admin Controller — /api/v1/admin/sla/**
 *
 * POLICIES:
 *   GET    /policies                      → all (includes priorityId, *TimeHours fields)
 *   GET    /policies/{priority}           → by priority enum
 *   POST   /policies                      → create/update (accepts hours OR minutes)
 *   DELETE /policies/{id}                 → delete by priorityId
 *
 * EVALUATIONS:
 *   GET    /evaluations                   → all ticket SLA records
 *   GET    /evaluations/{ticketId}        → by ticketId
 *   POST   /evaluations                   → register ticket
 *   PATCH  /evaluations/{ticketId}        → general update
 *
 * TICKET LIFECYCLE:
 *   POST   /evaluations/{ticketId}/hold   → put ON_HOLD (pause clock)
 *   POST   /evaluations/{ticketId}/resume → RESUME (accumulate pause time)
 *   POST   /evaluations/{ticketId}/resolve→ RESOLVE (set closureTime, stop clock)
 *   POST   /evaluations/{ticketId}/close  → CLOSE (terminal)
 *   PATCH  /evaluations/{ticketId}/status → change status explicitly
 *
 * ESCALATION CONFIG:
 *   GET    /escalations                   → all escalation levels
 *   GET    /escalations/{priority}        → by priority
 *   POST   /escalations                   → save/update escalation user
 *   DELETE /escalations/{id}              → delete
 *
 * DASHBOARD + UTILITY:
 *   GET    /dashboard
 *   POST   /refresh
 */
@RestController
@RequestMapping("/api/v1/admin/sla")
public class SlaAdminController {
 
    private final ISlaService slaService;
 
    public SlaAdminController(ISlaService slaService) {
        this.slaService = slaService;
    }
 
    // ── Policies ──────────────────────────────────────────────────────────────
 
    @GetMapping("/policies")
    public ResponseEntity<List<SlaPolicyResponse>> getAllPolicies() {
        return ResponseEntity.ok(slaService.getAllPolicies());
    }
 
    @GetMapping("/policies/{priority}")
    public ResponseEntity<SlaPolicyResponse> getPolicyByPriority(@PathVariable TicketPriority priority) {
        return ResponseEntity.ok(slaService.getPolicyByPriority(priority));
    }
 
    @PostMapping("/policies")
    public ResponseEntity<SlaPolicyResponse> createOrUpdatePolicy(
            @Valid @RequestBody SlaPolicyRequest request) {
        return ResponseEntity.ok(slaService.createOrUpdatePolicy(request));
    }
 
    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        slaService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }
 
    // ── Evaluations ───────────────────────────────────────────────────────────
 
    @GetMapping("/evaluations")
    public ResponseEntity<List<SlaEvaluationResponse>> getAllEvaluations() {
        return ResponseEntity.ok(slaService.getAllEvaluations());
    }
 
    @GetMapping("/evaluations/{ticketId}")
    public ResponseEntity<SlaEvaluationResponse> getEvaluation(@PathVariable Long ticketId) {
        return ResponseEntity.ok(slaService.getEvaluationByTicketId(ticketId));
    }
 
    @PostMapping("/evaluations")
    public ResponseEntity<SlaEvaluationResponse> registerTicket(
            @Valid @RequestBody SlaEvaluationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(slaService.registerTicket(request));
    }
 
    @PatchMapping("/evaluations/{ticketId}")
    public ResponseEntity<SlaEvaluationResponse> updateTicketSla(
            @PathVariable Long ticketId,
            @RequestBody SlaEvaluationRequest request) {
        return ResponseEntity.ok(slaService.updateTicketSla(ticketId, request));
    }
 
    // ── Ticket lifecycle ──────────────────────────────────────────────────────
 
    @PostMapping("/evaluations/{ticketId}/hold")
    public ResponseEntity<SlaEvaluationResponse> holdTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(slaService.holdTicket(ticketId));
    }
 
    @PostMapping("/evaluations/{ticketId}/resume")
    public ResponseEntity<SlaEvaluationResponse> resumeTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(slaService.resumeTicket(ticketId));
    }
 
    @PostMapping("/evaluations/{ticketId}/resolve")
    public ResponseEntity<SlaEvaluationResponse> resolveTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(slaService.resolveTicket(ticketId));
    }
 
    @PostMapping("/evaluations/{ticketId}/close")
    public ResponseEntity<SlaEvaluationResponse> closeTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(slaService.closeTicket(ticketId));
    }
 
    @PatchMapping("/evaluations/{ticketId}/status")
    public ResponseEntity<SlaEvaluationResponse> changeStatus(
            @PathVariable Long ticketId,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(slaService.changeTicketStatus(ticketId, status));
    }
 
    // ── Escalation config ─────────────────────────────────────────────────────
 
    @GetMapping("/escalations")
    public ResponseEntity<List<SlaEscalationLevelResponse>> getAllEscalations() {
        return ResponseEntity.ok(slaService.getAllEscalationLevels());
    }
 
    @GetMapping("/escalations/{priority}")
    public ResponseEntity<List<SlaEscalationLevelResponse>> getEscalationsByPriority(
            @PathVariable TicketPriority priority) {
        return ResponseEntity.ok(slaService.getEscalationLevelsByPriority(priority));
    }
 
    @PostMapping("/escalations")
    public ResponseEntity<SlaEscalationLevelResponse> saveEscalation(
            @Valid @RequestBody SlaEscalationLevelRequest request) {
        return ResponseEntity.ok(slaService.saveEscalationLevel(request));
    }
 
    @DeleteMapping("/escalations/{id}")
    public ResponseEntity<Void> deleteEscalation(@PathVariable Long id) {
        slaService.deleteEscalationLevel(id);
        return ResponseEntity.noContent().build();
    }
 
    // ── Dashboard + Utility ───────────────────────────────────────────────────
 
    @GetMapping("/dashboard")
    public ResponseEntity<SlaDashboardResponse> getDashboard() {
        return ResponseEntity.ok(slaService.getDashboard());
    }
 
    @PostMapping("/refresh")
    public ResponseEntity<String> forceRefresh() {
        slaService.refreshAllStatuses();
        return ResponseEntity.ok("SLA statuses refreshed.");
    }
}
 