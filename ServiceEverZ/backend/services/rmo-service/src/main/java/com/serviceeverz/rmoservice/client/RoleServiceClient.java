package com.serviceeverz.rmoservice.client;
 
import com.serviceeverz.rmoservice.client.dto.MapRoleRequest;
import com.serviceeverz.rmoservice.client.dto.RoleResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@FeignClient(name = "role-service")
public interface RoleServiceClient {
 
    @GetMapping("/api/v1/internal/roles")
    List<RoleResponse> getAllRoles();
 
    @GetMapping("/api/v1/internal/roles/user/{userId}")
    List<String> getRolesForUser(@PathVariable("userId") Long userId);
 
    @PostMapping("/api/v1/internal/roles/assign")
    String assignRole(@RequestBody MapRoleRequest req);
 
    @DeleteMapping("/api/v1/internal/roles/user/{userId}/role/{roleId}")
    void revokeRole(@PathVariable("userId") Long userId,
                    @PathVariable("roleId") Long roleId);
 // Check if a user has a specific role name
    @GetMapping("/api/v1/internal/roles/user/{userId}/has-role/{roleName}")
    boolean userHasRole(@PathVariable("userId") Long userId,
                        @PathVariable("roleName") String roleName);
}