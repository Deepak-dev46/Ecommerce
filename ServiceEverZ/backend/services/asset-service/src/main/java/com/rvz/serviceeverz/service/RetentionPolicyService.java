package com.rvz.serviceeverz.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.rvz.serviceeverz.dto.request.CreateRetentionPolicyRequest;
import com.rvz.serviceeverz.dto.request.UpdateRetentionPolicyRequest;
import com.rvz.serviceeverz.dto.response.RetentionPolicyResponse;
import com.rvz.serviceeverz.dto.response.UserSummaryResponse;
import com.rvz.serviceeverz.entity.RetentionPolicy;
import com.rvz.serviceeverz.enums.RetentionFrequency;
import com.rvz.serviceeverz.enums.RetentionType;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.repository.RetentionPolicyRepository;

@Service
public class RetentionPolicyService {

    private static final Logger log = LoggerFactory.getLogger(RetentionPolicyService.class);

    private final RetentionPolicyRepository retentionPolicyRepository;
    private final UserServiceClient userServiceClient;

    public RetentionPolicyService(RetentionPolicyRepository retentionPolicyRepository,
                                   UserServiceClient userServiceClient) {
        this.retentionPolicyRepository = retentionPolicyRepository;
        this.userServiceClient = userServiceClient;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    public RetentionPolicyResponse createPolicy(CreateRetentionPolicyRequest request) {
        if (retentionPolicyRepository.existsByPolicyNameIgnoreCase(request.getPolicyName())) {
            throw new RuntimeException("Retention policy with this name already exists");
        }

        RetentionPolicy policy = new RetentionPolicy();
        policy.setPolicyName(request.getPolicyName());
        policy.setDescription(request.getDescription());

        RetentionType resolvedType = resolveType(request.getType());
        policy.setType(resolvedType);
        if (resolvedType == RetentionType.OTHER) {
            String custom = request.getCustomType() != null && !request.getCustomType().isBlank()
                ? request.getCustomType().trim()
                : request.getType();
            policy.setCustomType(custom);
        } else {
            policy.setCustomType(null);
        }

        RetentionFrequency resolvedFrequency = resolveFrequency(request.getFrequency());
        policy.setFrequency(resolvedFrequency);
        if (resolvedFrequency == RetentionFrequency.OTHER) {
            String custom = request.getCustomFrequency() != null && !request.getCustomFrequency().isBlank()
                ? request.getCustomFrequency().trim()
                : request.getFrequency();
            policy.setCustomFrequency(custom);
        } else {
            policy.setCustomFrequency(null);
        }

        policy.setRetentionDays(resolveRetentionDays(request.getRetentionDays(), resolvedFrequency));
        policy.setIsActive(true);
        policy.setCreatedByManagerId(request.getCreatedByManagerId());

        return mapToResponse(retentionPolicyRepository.save(policy));
    }

    // ── GET ALL ───────────────────────────────────────────────────────────────
    public List<RetentionPolicyResponse> getAllPolicies() {
        return retentionPolicyRepository.findAll().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET ACTIVE ONLY ───────────────────────────────────────────────────────
    public List<RetentionPolicyResponse> getActivePolicies() {
        return retentionPolicyRepository.findAllByIsActiveTrue().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    public RetentionPolicyResponse getPolicyById(Long id) {
        return mapToResponse(findById(id));
    }

    // ── GET BY TYPE (active only) ─────────────────────────────────────────────
    public List<RetentionPolicyResponse> getPoliciesByType(String typeStr) {
        try {
            RetentionType type = RetentionType.valueOf(typeStr.toUpperCase());
            return retentionPolicyRepository.findAllByTypeAndIsActiveTrue(type).stream()
                    .map(this::mapToResponse).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return java.util.Collections.emptyList();
        }
    }

    // ── GET BY MANAGER ────────────────────────────────────────────────────────
    public List<RetentionPolicyResponse> getPoliciesByManager(Long managerId) {
        return retentionPolicyRepository.findAllByCreatedByManagerId(managerId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
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

        if (request.getType() != null && !request.getType().isBlank()) {
            RetentionType resolvedType = resolveType(request.getType());
            policy.setType(resolvedType);
            if (resolvedType == RetentionType.OTHER) {
                String custom = request.getCustomType() != null && !request.getCustomType().isBlank()
                    ? request.getCustomType().trim()
                    : request.getType();
                policy.setCustomType(custom);
            } else {
                policy.setCustomType(null);
            }
        }

        if (request.getFrequency() != null && !request.getFrequency().isBlank()) {
            RetentionFrequency resolvedFrequency = resolveFrequency(request.getFrequency());
            policy.setFrequency(resolvedFrequency);
            if (resolvedFrequency == RetentionFrequency.OTHER) {
                String custom = request.getCustomFrequency() != null && !request.getCustomFrequency().isBlank()
                    ? request.getCustomFrequency().trim()
                    : request.getFrequency();
                policy.setCustomFrequency(custom);
            } else {
                policy.setCustomFrequency(null);
            }
            if (request.getRetentionDays() != null) {
                policy.setRetentionDays(request.getRetentionDays());
            }
        } else if (request.getRetentionDays() != null) {
            policy.setRetentionDays(request.getRetentionDays());
        }

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

    private RetentionType resolveType(String typeStr) {
        if (typeStr == null) return RetentionType.OTHER;
        try {
            return RetentionType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return RetentionType.OTHER;
        }
    }

    private RetentionFrequency resolveFrequency(String freqStr) {
        if (freqStr == null) return RetentionFrequency.OTHER;
        try {
            return RetentionFrequency.valueOf(freqStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return RetentionFrequency.OTHER;
        }
    }

    private int resolveRetentionDays(Integer provided, RetentionFrequency frequency) {
        if (provided != null && provided >= 1) return provided;
        if (frequency == null) return 30;
        switch (frequency) {
            case DAILY:     return 1;
            case WEEKLY:    return 7;
            case MONTHLY:   return 30;
            case QUARTERLY: return 90;
            case YEARLY:    return 365;
            default:        return 30;
        }
    }

    /**
     * Resolves the manager's full name from UMS.
     * Falls back to "Manager #<id>" if UMS is unreachable or name is blank.
     */
    private String resolveManagerName(Long managerId) {
        if (managerId == null) return "—";
        try {
            UserSummaryResponse user = userServiceClient.getUserById(managerId);
            if (user != null && user.getFullName() != null && !user.getFullName().isBlank()) {
                return user.getFullName();
            }
        } catch (Exception e) {
            log.warn("Could not resolve manager name for userId={}: {}", managerId, e.getMessage());
        }
        return "Manager #" + managerId;
    }

    private RetentionPolicyResponse mapToResponse(RetentionPolicy policy) {
        RetentionPolicyResponse response = new RetentionPolicyResponse();
        response.setId(policy.getId());
        response.setPolicyName(policy.getPolicyName());
        response.setDescription(policy.getDescription());
        response.setType(policy.getType());
        response.setCustomType(policy.getCustomType());
        response.setFrequency(policy.getFrequency());
        response.setCustomFrequency(policy.getCustomFrequency());
        response.setRetentionDays(policy.getRetentionDays());
        response.setIsActive(policy.getIsActive());
        response.setCreatedByManagerId(policy.getCreatedByManagerId());
        // Resolve actual manager name from UMS instead of a placeholder
        response.setCreatedByManagerName(resolveManagerName(policy.getCreatedByManagerId()));
        response.setCreatedAt(policy.getCreatedAt());
        response.setUpdatedAt(policy.getUpdatedAt());
        return response;
    }
}
