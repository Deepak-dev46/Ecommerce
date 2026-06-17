package com.serviceeverz.userservice.client;
 
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
 
import java.util.List;
 
@FeignClient(name = "role-service")
public interface RoleServiceClient {
 
    // ── EXISTING ──────────────────────────────────────────────────────────────
    @GetMapping("/api/v1/internal/roles/user/{userId}")
    List<String> getRolesForUser(@PathVariable("userId") Long userId);
 
    @GetMapping("/api/v1/internal/roles/{roleId}/user-ids")
    List<Long> getUserIdsByRole(@PathVariable("roleId") Long roleId);
 
    @GetMapping("/api/v1/internal/roles/assigned-user-ids")
    List<Long> getAllAssignedUserIds();
 
    // ── NEW: get userIds by role NAME (not ID) ────────────────────────────────
    @GetMapping("/api/v1/internal/roles/by-name/{roleName}/user-ids")
    List<Long> getUserIdsByRoleName(@PathVariable("roleName") String roleName);
}
 