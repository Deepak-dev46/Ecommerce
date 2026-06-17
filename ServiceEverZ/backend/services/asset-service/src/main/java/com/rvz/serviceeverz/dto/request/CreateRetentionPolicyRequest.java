package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * NOTE: {@code type} and {@code frequency} are plain Strings so that clients can
 * send resolved custom values without causing Jackson enum-deserialization errors.
 * The service validates and maps them.
 */
public class CreateRetentionPolicyRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Type is required")
    private String type;

    private String customType;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    private String customFrequency;

    @Min(value = 1, message = "Retention days must be at least 1")
    private Integer retentionDays;

    @NotNull(message = "Manager ID is required")
    private Long createdByManagerId;

    public String getPolicyName() { return policyName; }
    public void setPolicyName(String policyName) { this.policyName = policyName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCustomType() { return customType; }
    public void setCustomType(String customType) { this.customType = customType; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getCustomFrequency() { return customFrequency; }
    public void setCustomFrequency(String customFrequency) { this.customFrequency = customFrequency; }

    public Integer getRetentionDays() { return retentionDays; }
    public void setRetentionDays(Integer retentionDays) { this.retentionDays = retentionDays; }

    public Long getCreatedByManagerId() { return createdByManagerId; }
    public void setCreatedByManagerId(Long createdByManagerId) { this.createdByManagerId = createdByManagerId; }
}
