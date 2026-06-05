package com.rvz.serviceeverz.dto.request;

import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.BackupFrequency;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public class CreateBackupScheduleRequest {

    @NotBlank(message = "Schedule name is required")
    private String scheduleName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Frequency is required")
    private BackupFrequency frequency;

    @NotNull(message = "Next backup time is required")
    @Future(message = "Next backup time must be in the future")
    private LocalDateTime nextBackupAt;

    @NotBlank(message = "Backup location is required")
    private String backupLocation;

    @NotNull(message = "SP ID is required")
    private Long createdBySpId;
    
    private Long assetId;

	public Long getAssetId() {
		return assetId;
	}

	public void setAssetId(Long assetId) {
		this.assetId = assetId;
	}

	public String getScheduleName() {
		return scheduleName;
	}

	public void setScheduleName(String scheduleName) {
		this.scheduleName = scheduleName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BackupFrequency getFrequency() {
		return frequency;
	}

	public void setFrequency(BackupFrequency frequency) {
		this.frequency = frequency;
	}

	public LocalDateTime getNextBackupAt() {
		return nextBackupAt;
	}

	public void setNextBackupAt(LocalDateTime nextBackupAt) {
		this.nextBackupAt = nextBackupAt;
	}

	public String getBackupLocation() {
		return backupLocation;
	}

	public void setBackupLocation(String backupLocation) {
		this.backupLocation = backupLocation;
	}

	public Long getCreatedBySpId() {
		return createdBySpId;
	}

	public void setCreatedBySpId(Long createdBySpId) {
		this.createdBySpId = createdBySpId;
	}
      
}
