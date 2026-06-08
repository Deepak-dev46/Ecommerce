package com.serviceeverz.userservice.organization.controller;
 
import com.serviceeverz.userservice.organization.dto.*;
import com.serviceeverz.userservice.organization.service.IOrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/v1/admin/org")
public class OrganizationAdminController {
 
    private final IOrganizationService service;
 
    public OrganizationAdminController(IOrganizationService service) {
        this.service = service;
    }
 
    @PostMapping("/departments")
    public ResponseEntity<DepartmentResponse> createDepartment(
            @Valid @RequestBody DepartmentRequest req,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId) {
        return ResponseEntity.ok(service.createDepartment(req, adminId == null ? 0L : adminId));
    }
 
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponse>> getDepartments() {
        return ResponseEntity.ok(service.getAllDepartments());
    }
 
    @PutMapping("/departments/{id}")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest req) {
        return ResponseEntity.ok(service.updateDepartment(id, req));
    }
 
    @PatchMapping("/departments/{id}/disable")
    public ResponseEntity<Void> disableDepartment(@PathVariable Long id) {
        service.disableDepartment(id);
        return ResponseEntity.noContent().build();
    }
 
    @PostMapping("/designations")
    public ResponseEntity<DesignationResponse> createDesignation(
            @Valid @RequestBody DesignationRequest req,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId) {
        return ResponseEntity.ok(service.createDesignation(req, adminId == null ? 0L : adminId));
    }
 
    @GetMapping("/designations")
    public ResponseEntity<List<DesignationResponse>> getDesignations(
            @RequestParam(required = false) Long departmentId) {
        if (departmentId != null) {
            return ResponseEntity.ok(service.getDesignationsByDepartment(departmentId));
        }
        return ResponseEntity.ok(service.getAllDesignations());
    }
 
    @PutMapping("/designations/{id}")
    public ResponseEntity<DesignationResponse> updateDesignation(
            @PathVariable Long id,
            @Valid @RequestBody DesignationRequest req) {
        return ResponseEntity.ok(service.updateDesignation(id, req));
    }
 
    @PatchMapping("/designations/{id}/disable")
    public ResponseEntity<Void> disableDesignation(@PathVariable Long id) {
        service.disableDesignation(id);
        return ResponseEntity.noContent().build();
    }
}
 