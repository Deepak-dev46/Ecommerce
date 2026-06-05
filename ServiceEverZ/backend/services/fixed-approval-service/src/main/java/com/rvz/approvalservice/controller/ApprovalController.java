package com.rvz.approvalservice.controller;

import com.rvz.approvalservice.dto.ApiResponse;
import com.rvz.approvalservice.dto.request.ApprovalActionRequest;
import com.rvz.approvalservice.dto.request.InitiateApprovalRequest;
import com.rvz.approvalservice.dto.response.ApprovalResponse;
import com.rvz.approvalservice.service.ApprovalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@CrossOrigin(origins = "*")
public class ApprovalController {

    private final ApprovalService approvalService;

    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    /**
     * Called by ticket-service after ticket is submitted
     */
    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<ApprovalResponse>> initiate(
            @Valid @RequestBody InitiateApprovalRequest request) {
        return ResponseEntity.ok(ok("Approval workflow initiated", approvalService.initiateApproval(request)));
    }

    /**
     * Called by frontend to approve/reject at L1 or L2 level
     */
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<ApprovalResponse>> process(
            @Valid @RequestBody ApprovalActionRequest request) {
        return ResponseEntity.ok(ok("Approval processed", approvalService.processApproval(request)));
    }

    /**
     * Alias /action → /process so frontend api.js works unchanged
     */
    @PostMapping("/action")
    public ResponseEntity<ApiResponse<ApprovalResponse>> action(
            @RequestBody ApprovalActionRequest request) {
        return ResponseEntity.ok(ok("Approval actioned", approvalService.processApproval(request)));
    }

    /**
     * Get approval status by ticket ID
     */
    @GetMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<ApprovalResponse>> getStatus(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ok("Approval status fetched", approvalService.getApprovalStatus(ticketId)));
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<ApprovalResponse>> getByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ok("Approval status fetched", approvalService.getApprovalStatus(ticketId)));
    }

    /**
     * FIX 2: GET /api/approvals/l1/pending?approverId=X approverId = logged-in
     * user's ID from the JWT/AuthContext. Returns ONLY tickets where
     * l1_approver_id matches that user — project-scoped. If approverId is
     * omitted, falls back to returning all pending L1 (for ITSM managers).
     */
    @GetMapping("/l1/pending")
    public ResponseEntity<ApiResponse<List<ApprovalResponse>>> getPendingL1(
            @RequestParam(required = false) String approverId) {
        return ResponseEntity.ok(ok("L1 pending approvals", approvalService.getPendingL1Approvals(approverId)));
    }

    /**
     * FIX 2: GET /api/approvals/l2/pending?approverId=X
     */
    @GetMapping("/l2/pending")
    public ResponseEntity<ApiResponse<List<ApprovalResponse>>> getPendingL2(
            @RequestParam(required = false) String approverId) {
        return ResponseEntity.ok(ok("L2 pending approvals", approvalService.getPendingL2Approvals(approverId)));
    }

    /**
     * FIX 3: GET /api/approvals/l1/history?approverId=X Returns tickets this L1
     * approver has already approved or rejected.
     */
    @GetMapping("/l1/history")
    public ResponseEntity<ApiResponse<List<ApprovalResponse>>> getL1History(
            @RequestParam(required = false) String approverId) {
        return ResponseEntity.ok(ok("L1 approval history", approvalService.getL1History(approverId)));
    }

    /**
     * FIX 3: GET /api/approvals/l2/history?approverId=X Returns tickets this L2
     * approver has already approved or rejected.
     */
    @GetMapping("/l2/history")
    public ResponseEntity<ApiResponse<List<ApprovalResponse>>> getL2History(
            @RequestParam(required = false) String approverId) {
        return ResponseEntity.ok(ok("L2 approval history", approvalService.getL2History(approverId)));
    }

    /**
     * GET /api/approvals/resource-owner/pending?approverId=X
     */
    @GetMapping("/resource-owner/pending")
    public ResponseEntity<ApiResponse<List<ApprovalResponse>>> getPendingResourceOwner(
            @RequestParam(required = false) String approverId) {
        return ResponseEntity.ok(ok("Resource owner pending approvals",
                approvalService.getPendingResourceOwnerApprovals(approverId)));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ok("Approval Service is running", "UP"));
    }

    private <T> ApiResponse<T> ok(String message, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setSuccess(true);
        r.setMessage(message);
        r.setData(data);
        r.setTimestamp(LocalDateTime.now());
        return r;
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingForApprover(
            @RequestParam(required = false) String approverId) {
        return ResponseEntity.ok(ok("All pending approvals for approver",
                approvalService.getPendingForApprover(approverId)));
    }

    /**
     * GET /api/approvals/history?approverId=X Returns all tickets already
     * processed by this approver (L1 or L2).
     */
    @GetMapping("/history")
    public ResponseEntity<?> getHistoryForApprover(
            @RequestParam(required = false) String approverId) {
        return ResponseEntity.ok(ok("Approval history for approver",
                approvalService.getHistoryForApprover(approverId)));
    }

    
    @GetMapping("/monitor/l1-pending")
    public ResponseEntity<?> monitorL1Pending() {
        return ResponseEntity.ok(ok("L1 pending tickets",
                approvalService.getAllPendingL1()));
    }

    /**
     * GET /api/approvals/monitor/l2-pending
     * All L2-pending tickets (L1 approved, L2 still pending).
     */
    @GetMapping("/monitor/l2-pending")
    public ResponseEntity<?> monitorL2Pending() {
        return ResponseEntity.ok(ok("L2 pending tickets",
                approvalService.getAllPendingL2()));
    }

    /**
     * GET /api/approvals/monitor/fully-approved
     * Tickets that passed ALL required approvals — ready for assignment.
     */
    @GetMapping("/monitor/fully-approved")
    public ResponseEntity<?> monitorFullyApproved() {
        return ResponseEntity.ok(ok("Fully approved tickets",
                approvalService.getAllFullyApproved()));
    }


}
