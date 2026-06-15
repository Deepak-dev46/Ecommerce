package com.rvz.serviceeverz.controller;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rvz.serviceeverz.dto.ApiResponse;
import com.rvz.serviceeverz.dto.BulkMailRequest;
import com.rvz.serviceeverz.dto.MailRequest;
import com.rvz.serviceeverz.service.MailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mail")
public class MailController {

	private static final Logger log = LoggerFactory.getLogger(MailController.class);

	private final MailService mailService;

	public MailController(MailService mailService) {
		this.mailService = mailService;
	}

	/**
	 * POST /api/mail/send Called by all microservices (asset-service,
	 * ticket-service, kb-service, etc.) Accepts: { "to": "...", "subject": "...",
	 * "body": "...", "htmlBody": true } Sender is always the configured Gmail —
	 * never passed by caller
	 */
	@PostMapping("/send")
	public ResponseEntity<ApiResponse<String>> sendMail(@Valid @RequestBody MailRequest request) {
		log.info("Mail request received — to={}, subject={}", request.getTo(), request.getSubject());
		String result = mailService.sendEmail(request);
		ApiResponse<String> response = new ApiResponse<>();
		response.setSuccess(true);
		response.setMessage("Email sent successfully");
		response.setData(result);
		response.setTimestamp(LocalDateTime.now());
		return ResponseEntity.ok(response);
	}

	/**
	 * POST /api/mail/send-bulk Called by change-management-service for: -
	 * Maintenance window broadcast (on APPROVED) - Freeze window broadcast (on
	 * freeze window creation)
	 */
	@PostMapping("/send-bulk")
	public ResponseEntity<ApiResponse<String>> sendBulkMail(@Valid @RequestBody BulkMailRequest request) {
		log.info("Bulk mail received — recipients={}", request.getRecipients().size());
		String result = mailService.sendBulkEmail(request);
		ApiResponse<String> response = new ApiResponse<>();
		response.setSuccess(true);
		response.setMessage("Bulk email sent successfully");
		response.setData(result);
		response.setTimestamp(LocalDateTime.now());
		return ResponseEntity.ok(response);
	}

	/**
	 * GET /api/mail/health Quick health check endpoint
	 */
	@GetMapping("/health")
	public ResponseEntity<ApiResponse<String>> health() {
		ApiResponse<String> response = new ApiResponse<>();
		response.setSuccess(true);
		response.setMessage("Mail Service is running");
		response.setData("UP");
		response.setTimestamp(LocalDateTime.now());
		return ResponseEntity.ok(response);
	}
}