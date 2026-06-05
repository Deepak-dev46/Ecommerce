package com.rvz.serviceeverz.dto.request;

import java.time.LocalDate;

import com.rvz.serviceeverz.enums.BackupFrequency;
import com.rvz.serviceeverz.enums.BackupStatus;

public class UpdateBackupScheduleRequest {

    private String scheduleName;
    private String description;
    private BackupStatus status;
    private BackupFrequency frequency;
    private Long assetId;
    private Long retentionPolicyId;

    // Removed @Future — service validates future date only when status is SCHEDULED
    private LocalDate scheduledDate;

    // Set to true to explicitly clear the linked retention policy
    private Boolean clearRetentionPolicy;

    public String getScheduleName() { return scheduleName; }
    public void setScheduleName(String scheduleName) { this.scheduleName = scheduleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BackupStatus getStatus() { return status; }
    public void setStatus(BackupStatus status) { this.status = status; }

    public BackupFrequency getFrequency() { return frequency; }
    public void setFrequency(BackupFrequency frequency) { this.frequency = frequency; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Long getRetentionPolicyId() { return retentionPolicyId; }
    public void setRetentionPolicyId(Long retentionPolicyId) { this.retentionPolicyId = retentionPolicyId; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public Boolean getClearRetentionPolicy() { return clearRetentionPolicy; }
    public void setClearRetentionPolicy(Boolean clearRetentionPolicy) { this.clearRetentionPolicy = clearRetentionPolicy; }
}
