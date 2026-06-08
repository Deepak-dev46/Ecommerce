package com.serviceeverz.emailservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.serviceeverz.emailservice.dto.MailOtpRequest;
import com.serviceeverz.emailservice.dto.TempPwRequest;
import com.serviceeverz.emailservice.service.EmailService;

@RestController
@RequestMapping("/api/v1/email")
public class EmailController {
	private final EmailService emailService;

	public EmailController(EmailService emailService) {
		this.emailService = emailService;
	}

	@PostMapping("/temp-password")
	public ResponseEntity<String> tempPassword(@RequestBody TempPwRequest req) {
		emailService.sendTempPassword(req.getEmail(), req.getTempPw(), req.getEmpId());
		return ResponseEntity.ok("Temp password sent");
	}
	@PostMapping("/otp")
	public ResponseEntity<String> sendOtp(@RequestBody MailOtpRequest req) {
	    emailService.sendOtp(req.getEmail(), req.getOtp());
	    return ResponseEntity.ok("OTP sent");
	}
}