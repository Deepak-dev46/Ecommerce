package com.relevantz.ticketservice.client;
 
import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
 
/**
 * Feign client to call role-service internal APIs.
 * role-service registers in Eureka as "role-service" (port 8082).
 */
@FeignClient(name = "role-service")
public interface RoleServiceClient {
 
    /**
     * Returns all userIds assigned to a role by name.
     * Maps to: GET /api/v1/internal/roles/by-name/{roleName}/user-ids
     * (InternalRoleController in role-service)
     */
    @GetMapping("/api/v1/internal/roles/by-name/{roleName}/user-ids")
    List<Long> getUserIdsByRoleName(@PathVariable("roleName") String roleName);
}
 
 