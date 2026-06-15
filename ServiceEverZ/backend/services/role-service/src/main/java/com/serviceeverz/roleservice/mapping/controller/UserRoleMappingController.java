package com.serviceeverz.roleservice.mapping.controller;
 
import com.serviceeverz.roleservice.dto.MapRoleRequest;
import com.serviceeverz.roleservice.entity.Role;
import com.serviceeverz.roleservice.mapping.dto.BulkMapRoleRequest;   // ✅ add
import com.serviceeverz.roleservice.mapping.service.IUserRoleMappingService;
import com.serviceeverz.roleservice.role.repository.RoleRepository;
import com.serviceeverz.roleservice.shared.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.ArrayList;    // ✅ add
import java.util.HashMap;      // ✅ add
import java.util.List;         // ✅ add
import java.util.Map;          // ✅ add
 
@RestController
@RequestMapping("/api/v1/admin/user-roles")
// @PreAuthorize("hasAuthority('ADMIN')")
public class UserRoleMappingController {
 
    private final IUserRoleMappingService service;
    private final RoleRepository roleRepository;
 
    public UserRoleMappingController(IUserRoleMappingService service,
                                     RoleRepository roleRepository) {
        this.service = service;
        this.roleRepository = roleRepository;
    }
 
    @PostMapping
    public ResponseEntity<String> assignRole(
            @Valid @RequestBody MapRoleRequest req,
            @RequestAttribute(value = "userId", required = false) Long adminId) {
 
        Role role = roleRepository.findById(req.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + req.getRoleId()));
 
        Long safeAdminId = (adminId != null) ? adminId : 0L;
        service.assignSingleRole(req, safeAdminId);
 
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Role " + role.getName() + " assigned to user " + req.getUserId());
    }
 
    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> assignRoleBulk(
            @Valid @RequestBody BulkMapRoleRequest req,
            @RequestAttribute(value = "userId", required = false) Long adminId) {
 
        Long safeAdminId = (adminId != null) ? adminId : 0L;
        List<Long> success = new ArrayList<>();
        List<String> failed = new ArrayList<>();
 
        for (Long userId : req.getUserIds()) {
            try {
                MapRoleRequest single = new MapRoleRequest();
                single.setUserId(userId);
                single.setRoleId(req.getRoleId());
                service.assignSingleRole(single, safeAdminId);
                success.add(userId);
            } catch (Exception e) {
                failed.add("userId " + userId + ": " + e.getMessage());
            }
        }
 
        Map<String, Object> result = new HashMap<>();
        result.put("assigned", success.size());
        result.put("failed", failed.size());
        result.put("errors", failed);
        return ResponseEntity.ok(result);
    }
 
    @DeleteMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<Void> revokeRole(@PathVariable Long userId,
                                           @PathVariable Long roleId) {
        service.revokeRole(userId, roleId);
        return ResponseEntity.noContent().build();
    }
 
    @GetMapping("/{userId}/roles")
    public ResponseEntity<List<String>> getRoles(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getRolesForUser(userId));
    }

    // Get all user-role mappings for report
@GetMapping("/report")
public ResponseEntity<List<Map<String, Object>>> getRoleDistributionReport() {
    return ResponseEntity.ok(service.getRoleDistributionReport());
}
 
}
 
 