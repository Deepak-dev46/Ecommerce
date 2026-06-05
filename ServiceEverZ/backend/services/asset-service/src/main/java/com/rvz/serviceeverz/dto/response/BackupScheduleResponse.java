package com.rvz.serviceeverz.dto.response;

import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.BackupFrequency;
import com.rvz.serviceeverz.enums.BackupStatus;

public class BackupScheduleResponse {
	private Long id;
	private String scheduleName;
	private String description;
	private BackupFrequency frequency;
	private LocalDateTime nextBackupAt;
	private LocalDateTime lastBackupAt;
	private BackupStatus status;
	private String backupLocation;
	private Long createdBySpId;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
    private Long assetId;

	public Long getAssetId() {
		return assetId;
	}
	public void setAssetId(Long assetId) {
		this.assetId = assetId;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
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
	public LocalDateTime getLastBackupAt() {
		return lastBackupAt;
	}
	public void setLastBackupAt(LocalDateTime lastBackupAt) {
		this.lastBackupAt = lastBackupAt;
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
	public Long getCreatedBySpId() {
		return createdBySpId;
	}
	public void setCreatedBySpId(Long createdBySpId) {
		this.createdBySpId = createdBySpId;
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
