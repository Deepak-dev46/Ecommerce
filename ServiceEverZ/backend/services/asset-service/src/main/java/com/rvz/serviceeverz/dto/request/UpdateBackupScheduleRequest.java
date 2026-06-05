package com.rvz.serviceeverz.dto.request;

import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.BackupFrequency;
import com.rvz.serviceeverz.enums.BackupStatus;

public class UpdateBackupScheduleRequest {

	private String scheduleName;
	private String description;
	private BackupFrequency frequency;
	private LocalDateTime nextBackupAt;
	private BackupStatus status;
	private String backupLocation;
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
	public BackupStatus getStatus() {
		return status;
	}
	public void setStatus(BackupStatus status) {
		this.status = status;
	}
	public String getBackupLocation() {
		return backupLocation;
	}
	public void setBackupLocation(String backupLocation) {
		this.backupLocation = backupLocation;
	}
}
