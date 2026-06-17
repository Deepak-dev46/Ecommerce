package com.serviceeverz.authservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.serviceeverz.authservice.dto.OtpRequest;

@FeignClient(name = "email-service")
public interface EmailClient {

    @PostMapping("/api/v1/email/otp")
    void sendOtp(@RequestBody OtpRequest request);
}
