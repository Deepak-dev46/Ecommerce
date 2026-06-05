package com.rvz.incidentservice.controller;

import com.rvz.incidentservice.dto.ApiResponse;
import com.rvz.incidentservice.dto.request.CreateIncidentRequest;
import com.rvz.incidentservice.dto.request.UpdateIncidentRequest;
import com.rvz.incidentservice.dto.response.IncidentResponse;
import com.rvz.incidentservice.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * REST endpoints for Incident tickets.
 *
 * POST   /api/incidents                  — create & submit incident (direct support assignment)
 * GET    /api/incidents/{id}             — fetch single incident
 * GET    /api/incidents?userId=X         — all incidents by user  (My Tickets)
 * GET    /api/incidents?assignedTo=X     — all incidents for a support person
 * GET    /api/incidents/all              — all incidents (admin/support dashboard)
 * PUT    /api/incidents/{id}             — update status, priority, or assignment
 * GET    /api/incidents/health           — health check
 */
@RestController
@RequestMapping("/api/incidents")
@CrossOrigin
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    /** Create and immediately submit an incident */
    @PostMapping
    public ResponseEntity<ApiResponse<IncidentResponse>> createIncident(
            @Valid @RequestBody CreateIncidentRequest request) {
        IncidentResponse data = incidentService.createIncident(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ok("Incident created and assigned successfully", data));
    }

    /** Fetch a single incident by its id */
    @GetMapping("/{incidentId}")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncident(
            @PathVariable Long incidentId) {
        return ResponseEntity.ok(ok("Incident fetched successfully",
                incidentService.getIncident(incidentId)));
    }

    /**
     * Fetch incidents by user OR by assignee.
     * GET /api/incidents?userId=X     → incidents raised by user X
     * GET /api/incidents?assignedTo=X → incidents assigned to support person X
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getIncidents(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long assignedTo) {

        List<IncidentResponse> data;
        if (userId != null) {
            data = incidentService.getIncidentsByUser(userId);
        } else if (assignedTo != null) {
            data = incidentService.getIncidentsByAssignee(assignedTo);
        } else {
            return ResponseEntity.badRequest()
                    .body(error("Provide userId or assignedTo query parameter"));
        }
        return ResponseEntity.ok(ok("Incidents fetched successfully", data));
    }

    /** Fetch all incidents — admin / support dashboard */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getAllIncidents() {
        return ResponseEntity.ok(ok("All incidents fetched successfully",
                incidentService.getAllIncidents()));
    }

    /** Update status, priority, or re-assign an incident */
    @PutMapping("/{incidentId}")
    public ResponseEntity<ApiResponse<IncidentResponse>> updateIncident(
            @PathVariable Long incidentId,
            @RequestBody UpdateIncidentRequest request) {
        return ResponseEntity.ok(ok("Incident updated successfully",
                incidentService.updateIncident(incidentId, request)));
    }

    /**
     * POST /api/incidents/{incidentId}/resolve
     * Body: { "resolutionNotes": "...", "supportPersonId": 9 }
     * Support resolves incident with a message → status = Pending_User_Ack
     */
    @PostMapping("/{incidentId}/resolve")
    public ResponseEntity<ApiResponse<IncidentResponse>> resolveIncident(
            @PathVariable Long incidentId,
            @RequestBody java.util.Map<String, Object> body) {
        String notes = body.get("resolutionNotes") != null
                ? body.get("resolutionNotes").toString() : null;
        if (notes == null || notes.isBlank()) {
            return ResponseEntity.badRequest().body(error("resolutionNotes is required"));
        }
        UpdateIncidentRequest req = new UpdateIncidentRequest();
        req.setStatus("Pending_User_Ack");
        req.setResolutionNotes(notes);
        return ResponseEntity.ok(ok("Incident resolved — user notified",
                incidentService.updateIncident(incidentId, req)));
    }
 
    /**
     * POST /api/incidents/{incidentId}/user-acknowledge
     * Body: { "userId": 4 }
     * User acknowledges → status = Resolved
     */
    @PostMapping("/{incidentId}/user-acknowledge")
    public ResponseEntity<ApiResponse<IncidentResponse>> userAcknowledge(
            @PathVariable Long incidentId,
            @RequestBody java.util.Map<String, Object> body) {
        UpdateIncidentRequest req = new UpdateIncidentRequest();
        req.setStatus("Resolved");
        return ResponseEntity.ok(ok("Acknowledgement recorded — support notified",
                incidentService.updateIncident(incidentId, req)));
    }
 
    
    /** Health check */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ok("Incident Service is running", "UP"));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private <T> ApiResponse<T> ok(String message, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setSuccess(true);
        r.setMessage(message);
        r.setData(data);
        r.setTimestamp(LocalDateTime.now());
        return r;
    }

    private <T> ApiResponse<T> error(String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setSuccess(false);
        r.setMessage(message);
        r.setTimestamp(LocalDateTime.now());
        return r;
    }
}
