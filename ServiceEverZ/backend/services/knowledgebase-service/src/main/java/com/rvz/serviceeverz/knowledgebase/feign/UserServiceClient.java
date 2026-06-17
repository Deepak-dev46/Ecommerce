package com.rvz.serviceeverz.knowledgebase.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * FIXED: fallback URL changed from 8081 → 8083 (user-service port).
 * The actual URL is resolved from application.properties:
 *   spring.cloud.openfeign.client.config.user-management-service.url=http://localhost:8083
 */
@FeignClient(
    name     = "user-management-service",
    url      = "${feign.client.url.user-management-service:http://localhost:8083}",
    fallback = UserServiceClientFallback.class
)
public interface UserServiceClient {

    /** Check if a user exists — used before creating KB articles */
    @GetMapping("/api/users/{userId}/exists")
    Boolean userExists(@PathVariable("userId") Long userId);

    /** Get full name — used to display author name in articles */
    @GetMapping("/api/users/{userId}/name")
    String getUserName(@PathVariable("userId") Long userId);
}
