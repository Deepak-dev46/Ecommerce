package com.serviceeverz.rmoservice.userview.controller;
 
import com.serviceeverz.rmoservice.client.RoleServiceClient;
import com.serviceeverz.rmoservice.client.UserServiceClient;
import com.serviceeverz.rmoservice.client.dto.MapRoleRequest;
import com.serviceeverz.rmoservice.client.dto.RoleResponse;
import com.serviceeverz.rmoservice.client.dto.UserResponse;
import com.serviceeverz.rmoservice.shared.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.Arrays;
import java.util.List;
 
@RestController
@RequestMapping("/api/v1/rmo/users")
@PreAuthorize("hasAuthority('RMO')")
public class RmoUserController {
 
    private final UserServiceClient userServiceClient;
    private final RoleServiceClient roleServiceClient;
 
    // UPDATED: RMO assigns only these 3 roles
    private static final List<String> RMO_ASSIGNABLE_ROLES = Arrays.asList(
            "RESOURCE_OWNER",
            "APPROVAL_MANAGER_L1",
            "APPROVAL_MANAGER_L2"
    );
 
    public RmoUserController(UserServiceClient userServiceClient,
                             RoleServiceClient roleServiceClient) {
        this.userServiceClient = userServiceClient;
        this.roleServiceClient = roleServiceClient;
    }
 
    // ── View all users ──
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userServiceClient.getAllUsers());
    }
 
    // ── View single user ──
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userServiceClient.getUserById(userId));
    }
 
    // ── Get all available roles ──
    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleServiceClient.getAllRoles());
    }
 
    // ── Get roles for a specific user ──
    @GetMapping("/{userId}/roles")
    public ResponseEntity<List<String>> getRolesForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(roleServiceClient.getRolesForUser(userId));
    }
 
    // ── RMO assigns role to user ──
    // Only RESOURCE_OWNER, APPROVAL_MANAGER_L1, APPROVAL_MANAGER_L2 allowed
    @PostMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<String> assignRole(@PathVariable Long userId,
                                             @PathVariable Long roleId) {
 
        // Fetch role name to validate against whitelist
        List<RoleResponse> allRoles = roleServiceClient.getAllRoles();
        RoleResponse targetRole = allRoles.stream()
                .filter(r -> r.getId().equals(roleId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Role not found: " + roleId));
 
        // Block if not in RMO allowed list
        if (!RMO_ASSIGNABLE_ROLES.contains(targetRole.getName())) {
            throw new BusinessException(
                    "RMO cannot assign role: " + targetRole.getName() +
                    ". RMO allowed roles: " + RMO_ASSIGNABLE_ROLES);
        }
 
        roleServiceClient.assignRole(new MapRoleRequest(userId, roleId));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Role " + targetRole.getName() + " assigned to user " + userId);
    }
 
    // ── RMO revokes role from user ──
    @DeleteMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<Void> revokeRole(@PathVariable Long userId,
                                           @PathVariable Long roleId) {
        roleServiceClient.revokeRole(userId, roleId);
        return ResponseEntity.noContent().build();
    }
}