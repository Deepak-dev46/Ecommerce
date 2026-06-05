package com.rvz.serviceeverz.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rvz.serviceeverz.dto.request.AdditionalDetailsRequest;
import com.rvz.serviceeverz.dto.request.AssetMappingRequest;
import com.rvz.serviceeverz.dto.request.AssetReleaseRequest;
import com.rvz.serviceeverz.dto.request.ManagerDecisionRequest;
import com.rvz.serviceeverz.dto.request.SupportPersonnelDecisionRequest;
import com.rvz.serviceeverz.dto.response.ApiResponse;
import com.rvz.serviceeverz.dto.response.AssetMappingResponse;
import com.rvz.serviceeverz.entity.AssetMappingHistory;
import com.rvz.serviceeverz.service.AssetMappingService;

import jakarta.validation.Valid;
 
@RestController
@RequestMapping("/api/asset-mappings")
@CrossOrigin(origins = "http://localhost:5173")
public class AssetMappingController {
 
    private final AssetMappingService mappingService;
 
    public AssetMappingController(AssetMappingService mappingService) { this.mappingService = mappingService; }
 
    private <T> ApiResponse<T> ok(String msg, T d) { return new ApiResponse<>(true, msg, d); }
 
    @PostMapping
    public ResponseEntity<ApiResponse<AssetMappingResponse>> create(@Valid @RequestBody AssetMappingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ok("Mapping created", mappingService.createMapping(req)));
    }
 
    @PutMapping("/{id}/sp-decision")
    public ResponseEntity<ApiResponse<AssetMappingResponse>> spDecision(
            @PathVariable Long id, @Valid @RequestBody SupportPersonnelDecisionRequest req) {
        return ResponseEntity.ok(ok("SP decision recorded", mappingService.spDecision(id, req)));
    }
 
    @PutMapping("/{id}/manager-decision")
    public ResponseEntity<ApiResponse<AssetMappingResponse>> managerDecision(
            @PathVariable Long id, @Valid @RequestBody ManagerDecisionRequest req) {
        return ResponseEntity.ok(ok("Manager decision recorded", mappingService.managerDecision(id, req)));
    }
 
    @PutMapping("/{id}/additional-details")
    public ResponseEntity<ApiResponse<AssetMappingResponse>> additionalDetails(
            @PathVariable Long id, @Valid @RequestBody AdditionalDetailsRequest req) {
        return ResponseEntity.ok(ok("Details submitted", mappingService.submitAdditionalDetails(id, req)));
    }
 
    @PutMapping("/{id}/release")
    public ResponseEntity<ApiResponse<AssetMappingResponse>> release(
            @PathVariable Long id, @Valid @RequestBody AssetReleaseRequest req) {
        return ResponseEntity.ok(ok("Asset released", mappingService.releaseAsset(id, req)));
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetMappingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ok("Mapping fetched", mappingService.getMappingById(id)));
    }
 
    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetMappingResponse>>> getAll() {
        return ResponseEntity.ok(ok("All mappings", mappingService.getAllMappings()));
    }
 
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AssetMappingResponse>>> byUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ok("User mappings", mappingService.getMappingsByUser(userId)));
    }
 
    @GetMapping("/sp/{spId}")
    public ResponseEntity<ApiResponse<List<AssetMappingResponse>>> bySp(@PathVariable Long spId) {
        return ResponseEntity.ok(ok("SP mappings", mappingService.getMappingsBySp(spId)));
    }
 
    @GetMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<List<AssetMappingResponse>>> byAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(ok("Asset mappings", mappingService.getMappingsByAsset(assetId)));
    }
 
    @GetMapping("/pending/sp")
    public ResponseEntity<ApiResponse<List<AssetMappingResponse>>> pendingSp() {
        return ResponseEntity.ok(ok("Pending SP approvals", mappingService.getPendingSpApprovals()));
    }
 
    @GetMapping("/pending/manager")
    public ResponseEntity<ApiResponse<List<AssetMappingResponse>>> pendingManager() {
        return ResponseEntity.ok(ok("Pending manager approvals", mappingService.getPendingManagerApprovals()));
    }
 
    @GetMapping("/history/asset/{assetId}")
    public ResponseEntity<ApiResponse<List<AssetMappingHistory>>> historyByAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(ok("Asset history", mappingService.getHistoryByAsset(assetId)));
    }
 
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<ApiResponse<List<AssetMappingHistory>>> historyByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ok("User history", mappingService.getHistoryByUser(userId)));
    }
}
 