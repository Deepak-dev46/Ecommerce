package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.Min;

/**
 * All fields are optional (partial update).
 *
 * NOTE: {@code type} and {@code frequency} are plain Strings (not enums) so that
 * clients can send resolved custom values (e.g. "MEDICAL") without triggering a
 * Jackson deserialization error.  The service layer validates and maps them to the
 * appropriate enum values.
 */
public class UpdateRetentionPolicyRequest {

    private String policyName;
    private String description;

    /** Accepts standard enum names (BACKUP, ARCHIVAL …) or a custom type string. */
    private String type;
    private String customType;

    /** Accepts standard enum names (DAILY, WEEKLY …) or a custom frequency string. */
    private String frequency;
    private String customFrequency;

    @Min(value = 1, message = "Retention days must be at least 1")
    private Integer retentionDays;

    private Boolean isActive;

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

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
