package com.rvz.emailticketservice.client;

import com.rvz.emailticketservice.config.RmoFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import java.util.Map;

/**
 * Calls rmo-service (port 8081).
 * Uses RmoFeignConfig to inject X-User-Roles: RMO header so @PreAuthorize passes.
 */
@FeignClient(name = "email-rmo-service", url = "${rmo.service.url}",
             configuration = RmoFeignConfig.class)
public interface RmoServiceClient {

    /** GET /api/v1/rmo/projects — returns List<ProjectResponse> */
    @GetMapping("/api/v1/rmo/projects")
    List<Map<String, Object>> getAllProjects();

    /** GET /api/v1/rmo/users/{userId} — returns UserResponse with id, fullName, email, employeeId */
    @GetMapping("/api/v1/rmo/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);
}