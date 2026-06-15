// FILE: auth-service/src/main/java/com/serviceeverz/authservice/client/RmoServiceClient.java
package com.serviceeverz.authservice.client;
 
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
 
/**
 * Calls rmo-service to determine a user's project-level roles.
 * Used at login time to compute effectiveRoles.
 * No JWT needed — internal Eureka-resolved call.
 */
@FeignClient(name = "rmo-service")
public interface RmoServiceClient {
 
    // Returns all project memberships for a user
    // Returns: List<ProjectMemberResponse> — but we only need the role flags
    // We use the dedicated endpoint added to rmo-service
    @GetMapping("/api/v1/internal/users/{userId}/effective-roles")
    List<String> getEffectiveRolesForUser(@PathVariable("userId") Long userId);
}
 