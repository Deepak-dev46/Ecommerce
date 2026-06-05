package com.rvz.serviceeverz.dto.request;

import java.time.LocalDate;

import com.rvz.serviceeverz.enums.BackupFrequency;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateBackupScheduleRequest {

    @NotBlank(message = "Schedule name is required")
    private String scheduleName;

    @NotBlank(message = "Description is required")
    private String description;

    private BackupFrequency frequency;

    private Long assetId;

    @NotNull(message = "Retention policy is required")
    private Long retentionPolicyId;

    @NotNull(message = "Scheduled date is required")
    @Future(message = "Scheduled date must be a future date")
    private LocalDate scheduledDate;

    /** Support Personnel who creates this schedule — required for mail notifications. */
    @NotNull(message = "Created-by SP ID is required")
    private Long createdBySpId;

    public String getScheduleName() { return scheduleName; }
    public void setScheduleName(String scheduleName) { this.scheduleName = scheduleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BackupFrequency getFrequency() { return frequency; }
    public void setFrequency(BackupFrequency frequency) { this.frequency = frequency; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Long getRetentionPolicyId() { return retentionPolicyId; }
    public void setRetentionPolicyId(Long retentionPolicyId) { this.retentionPolicyId = retentionPolicyId; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public Long getCreatedBySpId() { return createdBySpId; }
    public void setCreatedBySpId(Long createdBySpId) { this.createdBySpId = createdBySpId; }
}
