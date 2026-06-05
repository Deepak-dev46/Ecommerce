package com.rvz.serviceeverz.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.BackupFrequency;
import com.rvz.serviceeverz.enums.BackupStatus;

public class BackupScheduleResponse {
    private Long id;
    private String scheduleName;
    private String description;
    private BackupStatus status;
    private BackupFrequency frequency;
    private LocalDate scheduledDate;
    private LocalDate nextBackupDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Asset details
    private Long assetId;
    private String assetName;
    private String assetTag;

    // Retention policy details
    private Long retentionPolicyId;
    private String retentionPolicyName;
    private String retentionPolicyType;
    private String retentionPolicyFrequency;
    private Integer retentionPolicyDays;
    private Boolean retentionPolicyActive;

    // SP details
    private Long createdBySpId;
    private String createdBySpName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getScheduleName() { return scheduleName; }
    public void setScheduleName(String scheduleName) { this.scheduleName = scheduleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BackupStatus getStatus() { return status; }
    public void setStatus(BackupStatus status) { this.status = status; }

    public BackupFrequency getFrequency() { return frequency; }
    public void setFrequency(BackupFrequency frequency) { this.frequency = frequency; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public LocalDate getNextBackupDate() { return nextBackupDate; }
    public void setNextBackupDate(LocalDate nextBackupDate) { this.nextBackupDate = nextBackupDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public Long getRetentionPolicyId() { return retentionPolicyId; }
    public void setRetentionPolicyId(Long retentionPolicyId) { this.retentionPolicyId = retentionPolicyId; }

    public String getRetentionPolicyName() { return retentionPolicyName; }
    public void setRetentionPolicyName(String retentionPolicyName) { this.retentionPolicyName = retentionPolicyName; }

    public String getRetentionPolicyType() { return retentionPolicyType; }
    public void setRetentionPolicyType(String retentionPolicyType) { this.retentionPolicyType = retentionPolicyType; }

    public String getRetentionPolicyFrequency() { return retentionPolicyFrequency; }
    public void setRetentionPolicyFrequency(String retentionPolicyFrequency) { this.retentionPolicyFrequency = retentionPolicyFrequency; }

    public Integer getRetentionPolicyDays() { return retentionPolicyDays; }
    public void setRetentionPolicyDays(Integer retentionPolicyDays) { this.retentionPolicyDays = retentionPolicyDays; }

    public Boolean getRetentionPolicyActive() { return retentionPolicyActive; }
    public void setRetentionPolicyActive(Boolean retentionPolicyActive) { this.retentionPolicyActive = retentionPolicyActive; }

    public Long getCreatedBySpId() { return createdBySpId; }
    public void setCreatedBySpId(Long createdBySpId) { this.createdBySpId = createdBySpId; }

    public String getCreatedBySpName() { return createdBySpName; }
    public void setCreatedBySpName(String createdBySpName) { this.createdBySpName = createdBySpName; }
}
