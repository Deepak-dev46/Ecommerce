package com.serviceeverz.changemanagement.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.serviceeverz.changemanagement.dto.request.MailRequest;

@FeignClient(name = "mail-service", url = "${feign.client.mail-service.url}")
public interface MailServiceClient {

	// POST /api/mail/send — delegates all email sending to the centralized mail
	// service
	@PostMapping("/api/mail/send")
	void sendMail(@RequestBody MailRequest request);
}
