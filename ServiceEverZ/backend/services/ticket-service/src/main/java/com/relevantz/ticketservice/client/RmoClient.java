package com.relevantz.ticketservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "rmo-service", url = "${rmo.service.url}", configuration = RmoFeignConfig.class)
public interface RmoClient {

    // Returns ProjectResponse directly (no ApiResponse wrapper)
    @GetMapping("/api/v1/rmo/projects/{id}")
    Map<String, Object> getProjectById(@PathVariable("id") Long id);

    // Returns UserResponse directly — used to resolve L1/L2 manager name and email
    // RMO proxies this from user-service, so it always has the correct data
    @GetMapping("/api/v1/rmo/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);
}
