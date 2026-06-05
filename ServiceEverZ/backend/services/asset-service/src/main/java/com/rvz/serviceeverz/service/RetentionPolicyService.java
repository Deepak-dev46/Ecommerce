package com.rvz.serviceeverz.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rvz.serviceeverz.dto.request.CreateRetentionPolicyRequest;
import com.rvz.serviceeverz.dto.request.UpdateRetentionPolicyRequest;
import com.rvz.serviceeverz.dto.response.RetentionPolicyResponse;
import com.rvz.serviceeverz.entity.RetentionPolicy;
import com.rvz.serviceeverz.repository.RetentionPolicyRepository;

@Service
public class RetentionPolicyService {

	private final RetentionPolicyRepository retentionPolicyRepository;

	public RetentionPolicyService(RetentionPolicyRepository retentionPolicyRepository) {
		super();
		this.retentionPolicyRepository = retentionPolicyRepository;
	}

	// ── CREATE ────────────────────────────────────────────────────────────────
	public RetentionPolicyResponse createPolicy(CreateRetentionPolicyRequest request) {
		if (retentionPolicyRepository.existsByPolicyNameIgnoreCase(request.getPolicyName())) {
			throw new RuntimeException("Retention policy with this name already exists");
		}

		RetentionPolicy policy = new RetentionPolicy();
		policy.setPolicyName(request.getPolicyName());
		policy.setDescription(request.getDescription());
		policy.setFrequency(request.getFrequency());
		policy.setRetentionDays(request.getRetentionDays());
		policy.setIsActive(true);
		policy.setCreatedByManagerId(request.getCreatedByManagerId());

		return mapToResponse(retentionPolicyRepository.save(policy));
	}

	// ── GET ALL ───────────────────────────────────────────────────────────────
	public List<RetentionPolicyResponse> getAllPolicies() {
		return retentionPolicyRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
	}

	// ── GET ACTIVE ONLY ───────────────────────────────────────────────────────
	public List<RetentionPolicyResponse> getActivePolicies() {
		return retentionPolicyRepository.findAllByIsActiveTrue().stream().map(this::mapToResponse)
				.collect(Collectors.toList());
	}

	// ── GET BY ID ─────────────────────────────────────────────────────────────
	public RetentionPolicyResponse getPolicyById(Long id) {
		return mapToResponse(findById(id));
	}

	// ── GET BY MANAGER ────────────────────────────────────────────────────────
	public List<RetentionPolicyResponse> getPoliciesByManager(Long managerId) {
		return retentionPolicyRepository.findAllByCreatedByManagerId(managerId).stream().map(this::mapToResponse)
				.collect(Collectors.toList());
	}

	// ── UPDATE ────────────────────────────────────────────────────────────────
	public RetentionPolicyResponse updatePolicy(Long id, UpdateRetentionPolicyRequest request) {
		RetentionPolicy policy = findById(id);

		if (request.getPolicyName() != null && !request.getPolicyName().isBlank()) {
			if (!request.getPolicyName().equalsIgnoreCase(policy.getPolicyName())
					&& retentionPolicyRepository.existsByPolicyNameIgnoreCase(request.getPolicyName())) {
				throw new RuntimeException("Another policy with this name already exists");
			}
			policy.setPolicyName(request.getPolicyName());
		}
		if (request.getDescription() != null)
			policy.setDescription(request.getDescription());
		if (request.getFrequency() != null)
			policy.setFrequency(request.getFrequency());
		if (request.getRetentionDays() != null)
			policy.setRetentionDays(request.getRetentionDays());
		if (request.getIsActive() != null)
			policy.setIsActive(request.getIsActive());

		return mapToResponse(retentionPolicyRepository.save(policy));
	}

	// ── DELETE ────────────────────────────────────────────────────────────────
	public void deletePolicy(Long id) {
		retentionPolicyRepository.delete(findById(id));
	}

	// ── PRIVATE HELPERS ───────────────────────────────────────────────────────
	private RetentionPolicy findById(Long id) {
		return retentionPolicyRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Retention policy not found with id: " + id));
	}

	private RetentionPolicyResponse mapToResponse(RetentionPolicy policy) {
		RetentionPolicyResponse response = new RetentionPolicyResponse();
		response.setId(policy.getId());
		response.setPolicyName(policy.getPolicyName());
		response.setDescription(policy.getDescription());
		response.setFrequency(policy.getFrequency());
		response.setRetentionDays(policy.getRetentionDays());
		response.setIsActive(policy.getIsActive());
		response.setCreatedByManagerId(policy.getCreatedByManagerId());
		response.setCreatedAt(policy.getCreatedAt());
		response.setUpdatedAt(policy.getUpdatedAt());
		return response;
	}
}
