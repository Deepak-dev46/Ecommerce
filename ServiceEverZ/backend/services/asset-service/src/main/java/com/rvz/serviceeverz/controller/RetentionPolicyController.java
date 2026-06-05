package com.rvz.serviceeverz.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rvz.serviceeverz.dto.request.CreateRetentionPolicyRequest;
import com.rvz.serviceeverz.dto.request.UpdateRetentionPolicyRequest;
import com.rvz.serviceeverz.dto.response.RetentionPolicyResponse;
import com.rvz.serviceeverz.service.RetentionPolicyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assets/data-management/retention-policies")
@CrossOrigin
public class RetentionPolicyController {

	private final RetentionPolicyService retentionPolicyService;

	
	public RetentionPolicyController(RetentionPolicyService retentionPolicyService) {
		super();
		this.retentionPolicyService = retentionPolicyService;
	}

	// POST /api/assets/data-management/retention-policies
	@PostMapping
	public ResponseEntity<RetentionPolicyResponse> create(@Valid @RequestBody CreateRetentionPolicyRequest request) {
		return ResponseEntity.ok(retentionPolicyService.createPolicy(request));
	}

	// GET /api/assets/data-management/retention-policies
	@GetMapping
	public ResponseEntity<List<RetentionPolicyResponse>> getAll() {
		return ResponseEntity.ok(retentionPolicyService.getAllPolicies());
	}

	// GET /api/assets/data-management/retention-policies/active
	@GetMapping("/active")
	public ResponseEntity<List<RetentionPolicyResponse>> getActive() {
		return ResponseEntity.ok(retentionPolicyService.getActivePolicies());
	}

	// GET /api/assets/data-management/retention-policies/{id}
	@GetMapping("/{id}")
	public ResponseEntity<RetentionPolicyResponse> getById(@PathVariable Long id) {
		return ResponseEntity.ok(retentionPolicyService.getPolicyById(id));
	}

	// GET /api/assets/data-management/retention-policies/manager/{managerId}
	@GetMapping("/manager/{managerId}")
	public ResponseEntity<List<RetentionPolicyResponse>> getByManager(@PathVariable Long managerId) {
		return ResponseEntity.ok(retentionPolicyService.getPoliciesByManager(managerId));
	}

	// GET /api/assets/data-management/retention-policies/type/{type}
	@GetMapping("/type/{type}")
	public ResponseEntity<List<RetentionPolicyResponse>> getByType(@PathVariable String type) {
		return ResponseEntity.ok(retentionPolicyService.getPoliciesByType(type));
	}

	// PUT /api/assets/data-management/retention-policies/{id}
	@PutMapping("/{id}")
	public ResponseEntity<RetentionPolicyResponse> update(@PathVariable Long id,
			@Valid @RequestBody UpdateRetentionPolicyRequest request) {
		return ResponseEntity.ok(retentionPolicyService.updatePolicy(id, request));
	}

	// DELETE /api/assets/data-management/retention-policies/{id}
	@DeleteMapping("/{id}")
	public ResponseEntity<String> delete(@PathVariable Long id) {
		retentionPolicyService.deletePolicy(id);
		return ResponseEntity.ok("Retention policy deleted successfully");
	}
}
