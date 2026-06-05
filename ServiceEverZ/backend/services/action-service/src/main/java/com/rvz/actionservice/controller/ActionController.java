
package com.rvz.actionservice.controller;

import com.rvz.actionservice.dto.ApiResponse;
import com.rvz.actionservice.dto.request.AdditionalInputRequest;
import com.rvz.actionservice.dto.request.TicketActionRequest;
import com.rvz.actionservice.dto.response.ActionResponse;
import com.rvz.actionservice.service.ActionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * CORS is handled globally by CorsConfig — no @CrossOrigin here
 * to avoid conflict with allowCredentials=true.
 */
@RestController
@RequestMapping("/api/actions")
public class ActionController {

    private final ActionService actionService;

    public ActionController(ActionService actionService) {
        this.actionService = actionService;
    }

    @PostMapping("/working")
    public ResponseEntity<ApiResponse<ActionResponse>> working(
            @Valid @RequestBody TicketActionRequest request) {
        ActionResponse data = actionService.markWorking(request);
        ApiResponse<ActionResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Ticket marked as working successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/comment")
    public ResponseEntity<ApiResponse<ActionResponse>> comment(
            @Valid @RequestBody TicketActionRequest request) {
        ActionResponse data = actionService.addComment(request);
        ApiResponse<ActionResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Comment added successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/additional-input")
    public ResponseEntity<ApiResponse<ActionResponse>> additionalInput(
            @Valid @RequestBody AdditionalInputRequest request) {
        ActionResponse data = actionService.requestAdditionalInput(request);
        ApiResponse<ActionResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Additional input request created successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/close")
    public ResponseEntity<ApiResponse<ActionResponse>> close(
            @Valid @RequestBody TicketActionRequest request) {
        ActionResponse data = actionService.closeTicket(request);
        ApiResponse<ActionResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Ticket closed successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ticketId}/timeline")
    public ResponseEntity<ApiResponse<List<ActionResponse>>> timeline(
            @PathVariable Long ticketId) {
        List<ActionResponse> data = actionService.getTimeline(ticketId);
        ApiResponse<List<ActionResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Action timeline fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        ApiResponse<String> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Action Service is running");
        response.setData("UP");
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    // ── NEW endpoints (auto-close feature) ───────────────────────────────────

    /**
     * Resolve a ticket.
     * Saves a RESOLVED action record and starts the auto-close countdown timer.
     *
     * Request body:
     *   { "ticketId": 42, "actionBy": "agent1", "comments": "Issue fixed.", "slaId": 3 }
     *
     * slaId is optional; omit it if the ticket has no SLA policy attached.
     */
    @PostMapping("/resolve")
    public ResponseEntity<ApiResponse<ActionResponse>> resolve(
            @Valid @RequestBody TicketActionRequest request) {
        ActionResponse data = actionService.resolveTicket(request);
        ApiResponse<ActionResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Ticket resolved successfully. Auto-close timer started.");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * Reopen a resolved ticket.
     * Saves a REOPENED action record and IMMEDIATELY stops the auto-close timer.
     * Throws 400 if the ticket is already CLOSED.
     *
     * Request body:
     *   { "ticketId": 42, "actionBy": "agent1", "comments": "Customer reported it still fails." }
     */
    @PostMapping("/reopen")
    public ResponseEntity<ApiResponse<ActionResponse>> reopen(
            @Valid @RequestBody TicketActionRequest request) {
        ActionResponse data = actionService.reopenTicket(request);
        ApiResponse<ActionResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Ticket reopened successfully. Auto-close timer cancelled.");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
