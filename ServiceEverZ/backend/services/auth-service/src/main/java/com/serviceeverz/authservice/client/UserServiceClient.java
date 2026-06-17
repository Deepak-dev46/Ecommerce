package com.serviceeverz.authservice.client;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.serviceeverz.authservice.dto.UserDetailDto;

/**
 * Calls user-service internal endpoint (no JWT, resolved via Eureka).
 */
@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/v1/internal/users/by-email/{email}")
    UserDetailDto getUserByEmail(@PathVariable("email") String email);
    
    @PostMapping("/api/v1/internal/users/{email}/failed-attempt")
    void incrementFailedAttempt(@PathVariable("email") String email);

    @PostMapping("/api/v1/internal/users/{email}/reset-attempt")
    void resetFailedAttempt(@PathVariable("email") String email);
    
    @PostMapping("/api/v1/internal/users/{email}/reset-password")
    void resetPasswordAfterOtp(@PathVariable("email") String email, @RequestBody Map<String, String> request);
    
    @PatchMapping("/api/v1/internal/users/{email}/activate")
    void activateUser(@PathVariable("email") String email);
     
    
}
