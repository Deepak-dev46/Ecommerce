package com.rvz.serviceeverz.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rvz.serviceeverz.dto.request.CreateChangePlanRequest;
import com.rvz.serviceeverz.dto.request.ManagerDecisionRequest;
import com.rvz.serviceeverz.dto.request.UpdateChangePlanRequest;
import com.rvz.serviceeverz.dto.response.ApiResponse;
import com.rvz.serviceeverz.dto.response.ChangeAuditLogResponse;
import com.rvz.serviceeverz.dto.response.ChangePlanResponse;
import com.rvz.serviceeverz.enums.ChangeStatus;
import com.rvz.serviceeverz.service.ChangePlanService;

import java.util.List;

@RestController
@RequestMapping("/api/change-management/change-plans")
@CrossOrigin
public class ChangePlanController {

    private final ChangePlanService changePlanService;

    public ChangePlanController(ChangePlanService changePlanService) {
        this.changePlanService = changePlanService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChangePlanResponse>> create(@RequestBody CreateChangePlanRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Change plan created", changePlanService.createChangePlan(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChangePlanResponse>> update(@PathVariable Long id, @RequestBody UpdateChangePlanRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Change plan updated", changePlanService.updateChangePlan(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        changePlanService.deleteChangePlan(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Change plan deleted", null));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<ChangePlanResponse>> submit(@PathVariable Long id, @RequestParam Long spId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Submitted for approval", changePlanService.submitForApproval(id, spId)));
    }

    @PostMapping("/{id}/decision")
    public ResponseEntity<ApiResponse<ChangePlanResponse>> makeDecision(@PathVariable Long id, @Valid @RequestBody ManagerDecisionRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Decision recorded", changePlanService.makeDecision(id, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChangePlanResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", changePlanService.getAllChangePlans()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChangePlanResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", changePlanService.getChangePlanById(id)));
    }

    @GetMapping("/sp/{spId}")
    public ResponseEntity<ApiResponse<List<ChangePlanResponse>>> getBySp(@PathVariable Long spId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", changePlanService.getChangePlansBySpId(spId)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ChangePlanResponse>>> getByStatus(@PathVariable ChangeStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", changePlanService.getChangePlansByStatus(status)));
    }

    @GetMapping("/{id}/audit-logs")
    public ResponseEntity<ApiResponse<List<ChangeAuditLogResponse>>> getAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", changePlanService.getAuditLogs(id)));
    }
}
