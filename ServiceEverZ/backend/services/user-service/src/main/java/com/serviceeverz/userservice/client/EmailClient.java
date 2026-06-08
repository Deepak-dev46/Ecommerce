package com.serviceeverz.userservice.client;

import com.serviceeverz.userservice.client.dto.TempPwRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "email-service")
public interface EmailClient {
	@PostMapping("/api/v1/email/temp-password")
	String sendTempPassword(@RequestBody TempPwRequest req);
}