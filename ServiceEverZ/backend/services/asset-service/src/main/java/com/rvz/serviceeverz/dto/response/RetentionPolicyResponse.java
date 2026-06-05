package com.rvz.serviceeverz.dto.response;

import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.RetentionFrequency;

public class RetentionPolicyResponse {
	private Long id;
	private String policyName;
	private String description;
	private RetentionFrequency frequency;
	private Integer retentionDays;
	private Boolean isActive;
	private Long createdByManagerId;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
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
	public Long getCreatedByManagerId() {
		return createdByManagerId;
	}
	public void setCreatedByManagerId(Long createdByManagerId) {
		this.createdByManagerId = createdByManagerId;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
	
	
}
