package com.rvz.serviceeverz.dto.request;

import com.rvz.serviceeverz.enums.RetentionFrequency;

import jakarta.validation.constraints.Min;

public class UpdateRetentionPolicyRequest {

    private String policyName;
    private String description;
    private RetentionFrequency frequency;

    @Min(value = 1, message = "Retention days must be at least 1")
    private Integer retentionDays;

    private Boolean isActive;

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

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}
    
    
}
