package com.rvz.serviceeverz.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rvz.serviceeverz.enums.RetentionFrequency;
import com.rvz.serviceeverz.enums.RetentionType;

public class RetentionPolicyResponse {
    private Long id;
    private String policyName;
    private String description;

    // Serialize enums as plain strings so the frontend can compare directly
    private String type;
    private String customType;
    private String frequency;
    private String customFrequency;

    private Integer retentionDays;

    @JsonProperty("isActive")
    private Boolean isActive;

    private Long createdByManagerId;

    // Frontend renders policy.createdByManagerName — expose the manager id
    // as a display-friendly string until a user-service lookup is wired in.
    private String createdByManagerName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Getters / Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPolicyName() { return policyName; }
    public void setPolicyName(String policyName) { this.policyName = policyName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    /** Accept RetentionType enum and store as its name string. */
    public void setType(RetentionType type) { this.type = type != null ? type.name() : null; }
    /** Direct string setter used internally. */
    public void setTypeStr(String type) { this.type = type; }

    public String getCustomType() { return customType; }
    public void setCustomType(String customType) { this.customType = customType; }

    public String getFrequency() { return frequency; }
    /** Accept RetentionFrequency enum and store as its name string. */
    public void setFrequency(RetentionFrequency frequency) { this.frequency = frequency != null ? frequency.name() : null; }
    /** Direct string setter used internally. */
    public void setFrequencyStr(String frequency) { this.frequency = frequency; }

    public String getCustomFrequency() { return customFrequency; }
    public void setCustomFrequency(String customFrequency) { this.customFrequency = customFrequency; }

    public Integer getRetentionDays() { return retentionDays; }
    public void setRetentionDays(Integer retentionDays) { this.retentionDays = retentionDays; }

    @JsonProperty("isActive")
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getCreatedByManagerId() { return createdByManagerId; }
    public void setCreatedByManagerId(Long createdByManagerId) { this.createdByManagerId = createdByManagerId; }

    public String getCreatedByManagerName() { return createdByManagerName; }
    public void setCreatedByManagerName(String createdByManagerName) { this.createdByManagerName = createdByManagerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
