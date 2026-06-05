package com.rvz.emailticketservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

/**
 * Feign client for master-data-service.
 * Used to validate user identity and resolve all master-data IDs from names.
 */
@FeignClient(name = "master-data-service-email", url = "${master.service.url}")
public interface MasterDataClient {

    @GetMapping("/api/master/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);

    /** Validate sender's email exists in system. */
    @GetMapping("/api/master/users/email/{email}")
    Map<String, Object> getUserByEmail(@PathVariable("email") String email);

    @GetMapping("/api/master/users")
    Map<String, Object> getUsers(@RequestParam(value = "status", required = false) String status);

    @GetMapping("/api/master/categories")
    Map<String, Object> getAllCategories();

    @GetMapping("/api/master/subcategories")
    Map<String, Object> getAllSubcategories();

    @GetMapping("/api/master/items")
    Map<String, Object> getAllItems();

    @GetMapping("/api/master/priority-sla")
    Map<String, Object> getAllPriorities();

    @GetMapping("/api/master/projects")
    Map<String, Object> getAllProjects();
}
