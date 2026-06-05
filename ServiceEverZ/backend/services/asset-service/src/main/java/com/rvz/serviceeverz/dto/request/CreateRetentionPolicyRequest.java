package com.rvz.serviceeverz.dto.request;

import com.rvz.serviceeverz.enums.RetentionFrequency;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateRetentionPolicyRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Frequency is required")
    private RetentionFrequency frequency;

    @NotNull(message = "Retention days is required")
    @Min(value = 1, message = "Retention days must be at least 1")
    private Integer retentionDays;

    @NotNull(message = "Manager ID is required")
    private Long createdByManagerId;

	public String getPolicyName() {
		return policyName;
	}

	public void setPolicyName(String policyName) {
		this.policyName = policyName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public RetentionFrequency getFrequency() {
		return frequency;
	}

	public void setFrequency(RetentionFrequency frequency) {
		this.frequency = frequency;
	}

	public Integer getRetentionDays() {
		return retentionDays;
	}

	public void setRetentionDays(Integer retentionDays) {
		this.retentionDays = retentionDays;
	}

	public Long getCreatedByManagerId() {
		return createdByManagerId;
	}

	public void setCreatedByManagerId(Long createdByManagerId) {
		this.createdByManagerId = createdByManagerId;
	}
    
}
