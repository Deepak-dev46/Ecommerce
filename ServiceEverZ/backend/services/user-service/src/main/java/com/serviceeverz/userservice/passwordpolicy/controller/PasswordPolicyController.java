package com.serviceeverz.userservice.passwordpolicy.controller;

import com.serviceeverz.userservice.passwordpolicy.dto.*;
import com.serviceeverz.userservice.passwordpolicy.service.IPasswordPolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/password-policy")
public class PasswordPolicyController {
	private final IPasswordPolicyService service;

	public PasswordPolicyController(IPasswordPolicyService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<PasswordPolicyResponse> save(@RequestBody PasswordPolicyRequest req) {
		return ResponseEntity.ok(service.savePolicy(req));
	}

	@GetMapping
	public ResponseEntity<PasswordPolicyResponse> get() {
		return ResponseEntity.ok(service.getPolicy());
	}
}