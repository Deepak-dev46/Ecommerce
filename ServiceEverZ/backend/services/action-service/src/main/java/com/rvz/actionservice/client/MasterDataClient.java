package com.rvz.actionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

/**
 * Feign client for master-data-service.
 * Used to resolve real user email addresses by user ID
 * so that action-service never sends to hardcoded placeholder addresses.
 */
@FeignClient(name = "master-data-service-action", url = "${master.service.url}")
public interface MasterDataClient {

    @GetMapping("/api/master/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);
}
