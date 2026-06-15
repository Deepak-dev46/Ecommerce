// FILE: user-service/src/main/java/com/serviceeverz/userservice/rolefeature/controller/RoleFeatureController.java
package com.serviceeverz.userservice.rolefeature.controller;
 
import com.serviceeverz.userservice.rolefeature.dto.RoleFeatureDto;
import com.serviceeverz.userservice.rolefeature.dto.ToggleFeatureRequest;
import com.serviceeverz.userservice.rolefeature.service.RoleFeatureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/v1/admin/role-features")
public class RoleFeatureController {
 
    private final RoleFeatureService service;
 
    public RoleFeatureController(RoleFeatureService service) {
        this.service = service;
    }
 
    // ── GET all roles with features (admin overview page) ─────────────────────
    @GetMapping
    public ResponseEntity<Map<String, List<RoleFeatureDto>>> getAll() {
        return ResponseEntity.ok(service.getAllRoleFeatures());
    }
 
    // ── GET features for a single role ────────────────────────────────────────
    @GetMapping("/{roleName}")
    public ResponseEntity<List<RoleFeatureDto>> getForRole(
            @PathVariable String roleName) {
        return ResponseEntity.ok(service.getFeaturesForRole(roleName));
    }
 
    // ── GET only enabled feature keys for a role (used at login enrichment) ───
    @GetMapping("/{roleName}/enabled-keys")
    public ResponseEntity<List<String>> getEnabledKeys(
            @PathVariable String roleName) {
        return ResponseEntity.ok(service.getEnabledFeatureKeys(roleName));
    }
 
    // ── PATCH single toggle ────────────────────────────────────────────────────
    @PatchMapping("/toggle")
    public ResponseEntity<RoleFeatureDto> toggle(
            @RequestBody ToggleFeatureRequest req,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        return ResponseEntity.ok(
            service.toggleFeature(req, adminEmail == null ? "admin" : adminEmail));
    }
 
    // ── PATCH bulk toggle ──────────────────────────────────────────────────────
    @PatchMapping("/bulk-toggle")
    public ResponseEntity<List<RoleFeatureDto>> bulkToggle(
            @RequestBody ToggleFeatureRequest req,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        return ResponseEntity.ok(
            service.bulkToggle(req, adminEmail == null ? "admin" : adminEmail));
    }
 
    // ── DELETE / reset a role's overrides ─────────────────────────────────────
    @DeleteMapping("/{roleName}/reset")
    public ResponseEntity<List<RoleFeatureDto>> reset(
            @PathVariable String roleName,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        return ResponseEntity.ok(
            service.resetRole(roleName, adminEmail == null ? "admin" : adminEmail));
    }
}
 