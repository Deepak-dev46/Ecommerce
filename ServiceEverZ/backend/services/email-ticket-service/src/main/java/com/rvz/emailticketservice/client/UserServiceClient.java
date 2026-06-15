package com.rvz.emailticketservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

/**
 * Calls user-service internal endpoint (port 8083).
 * GET /api/v1/internal/users/by-email/{email}
 * Returns InternalUserDetailDto: id, firstName, lastName, email, status
 */
@FeignClient(name = "email-user-service", url = "${user.service.url}")
public interface UserServiceClient {
    @GetMapping("/api/v1/internal/users/by-email/{email}")
    Map<String, Object> getUserByEmail(@PathVariable("email") String email);
}