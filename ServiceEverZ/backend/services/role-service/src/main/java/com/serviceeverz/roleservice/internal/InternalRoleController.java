package com.serviceeverz.roleservice.internal;
 
import java.util.List;
import java.util.stream.Collectors;
 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import com.serviceeverz.roleservice.dto.MapRoleRequest;
import com.serviceeverz.roleservice.mapping.entity.UserRoleMapping;
import com.serviceeverz.roleservice.mapping.repository.UserRoleMappingRepository;
import com.serviceeverz.roleservice.mapping.service.IUserRoleMappingService;
import com.serviceeverz.roleservice.permission.service.IRolePermissionService;
import com.serviceeverz.roleservice.role.dto.RoleResponse;
import com.serviceeverz.roleservice.role.repository.RoleRepository;
import com.serviceeverz.roleservice.role.service.IRoleService;
import com.serviceeverz.roleservice.shared.enums.PermissionType;
 
@RestController
@RequestMapping("/api/v1/internal/roles")
public class InternalRoleController {
 
    private final IUserRoleMappingService mappingService;
    private final IRolePermissionService permissionService;
    private final IRoleService roleService;
    private final UserRoleMappingRepository mappingRepo;
    private final RoleRepository roleRepository;  // ── NEW
 
    public InternalRoleController(IUserRoleMappingService mappingService,
                                  IRolePermissionService permissionService,
                                  IRoleService roleService,
                                  UserRoleMappingRepository mappingRepo,
                                  RoleRepository roleRepository) {
        this.mappingService = mappingService;
        this.permissionService = permissionService;
        this.roleService = roleService;
        this.mappingRepo = mappingRepo;
        this.roleRepository = roleRepository;
    }
 
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<String>> getRolesForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(mappingService.getRolesForUser(userId));
    }
 
    @GetMapping("/{roleId}/permissions")
    public ResponseEntity<Boolean> hasPermission(@PathVariable Long roleId,
                                                 @RequestParam String module,
                                                 @RequestParam String feature,
                                                 @RequestParam PermissionType type) {
        return ResponseEntity.ok(permissionService.hasPermission(roleId, module, feature, type));
    }
 
    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }
 
    @PostMapping("/assign")
    public ResponseEntity<String> assignRole(@RequestBody MapRoleRequest req) {
        mappingService.assignRole(req, 0L);
        return ResponseEntity.ok("Role assigned successfully");
    }
 
    @DeleteMapping("/user/{userId}/role/{roleId}")
    public ResponseEntity<Void> revokeRole(@PathVariable Long userId,
                                           @PathVariable Long roleId) {
        mappingService.revokeRole(userId, roleId);
        return ResponseEntity.noContent().build();
    }
 
    @GetMapping("/user/{userId}/has-role/{roleName}")
    public ResponseEntity<Boolean> userHasRole(@PathVariable Long userId,
                                               @PathVariable String roleName) {
        List<String> roles = mappingService.getRolesForUser(userId);
        return ResponseEntity.ok(roles.contains(roleName));
    }
 
    @GetMapping("/{roleId}/user-ids")
    public List<Long> getUserIdsByRole(@PathVariable Long roleId) {
        return mappingRepo.findByRole_IdAndActiveTrue(roleId)
            .stream().map(UserRoleMapping::getUserId).collect(Collectors.toList());
    }
 
    @GetMapping("/assigned-user-ids")
    public List<Long> getAllAssignedUserIds() {
        return mappingRepo.findByActiveTrue()
            .stream().map(UserRoleMapping::getUserId).distinct().collect(Collectors.toList());
    }
 
    // ── NEW: get userIds by role NAME ─────────────────────────────────────────
    @GetMapping("/by-name/{roleName}/user-ids")
    public ResponseEntity<List<Long>> getUserIdsByRoleName(@PathVariable String roleName) {
        return roleRepository.findByNameIgnoreCase(roleName)
            .map(role -> ResponseEntity.ok(
                mappingRepo.findByRole_IdAndActiveTrue(role.getId())
                    .stream().map(UserRoleMapping::getUserId).collect(Collectors.toList())
            ))
            .orElse(ResponseEntity.ok(List.of()));
    }
}
 