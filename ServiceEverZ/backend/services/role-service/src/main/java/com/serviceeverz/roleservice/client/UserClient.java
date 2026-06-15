package com.serviceeverz.roleservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// @FeignClient(name = "user-service")
// public interface UserClient {
//     @GetMapping("/api/v1/internal/users/{userId}/active")
//     boolean isUserActive(@PathVariable("userId") Long userId);
// }

// @FeignClient(name = "user-service")
// public interface UserClient {
//     @GetMapping("/api/v1/internal/users/{userId}/active")
//     boolean isUserActive(@PathVariable("userId") Long userId);
// }
 

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/v1/internal/users/{userId}/active")
    boolean isUserActive(@PathVariable("userId") Long userId);
 
    // Fetch full user details to get firstName + lastName
    @GetMapping("/api/v1/admin/users/{userId}")
    java.util.Map<String, Object> getUserById(@PathVariable("userId") Long userId);
}
 