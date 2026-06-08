package com.relevantz.ticketservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

/**
 * Feign client that calls Team A's user-service via the API Gateway
 * to resolve email addresses for users who exist in their serviceeverz DB.
 * This is used when master-data-service doesn't have the user.
 */
@FeignClient(name = "their-user-service", url = "${their.user.service.url}")
public interface UserServiceClient {

    @GetMapping("/api/v1/admin/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);
}
