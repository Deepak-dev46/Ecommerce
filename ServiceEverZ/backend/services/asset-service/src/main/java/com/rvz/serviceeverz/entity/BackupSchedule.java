package com.rvz.serviceeverz.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.rvz.serviceeverz.enums.BackupFrequency;
import com.rvz.serviceeverz.enums.BackupStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "backup_schedules")
public class BackupSchedule {

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

	public BackupStatus getStatus() {
		return status;
	}

	public void setStatus(BackupStatus status) {
		this.status = status;
	}

	public LocalDateTime getLastBackupAt() {
		return lastBackupAt;
	}

	public void setLastBackupAt(LocalDateTime lastBackupAt) {
		this.lastBackupAt = lastBackupAt;
	}

	public Long getCreatedBySpId() {
		return createdBySpId;
	}

	public void setCreatedBySpId(Long createdBySpId) {
		this.createdBySpId = createdBySpId;
	}

	public String getBackupLocation() {
		return backupLocation;
	}

	public void setBackupLocation(String backupLocation) {
		this.backupLocation = backupLocation;
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

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String scheduleName;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupFrequency frequency;

    @Column(nullable = false)
    private LocalDateTime nextBackupAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupStatus status;

    @Column
    private LocalDateTime lastBackupAt;

    @Column(nullable = false)
    private Long createdBySpId;
    @Column
    private Long assetId;

    @Column
    private String backupLocation;

    public Long getAssetId() {
		return assetId;
	}

	public void setAssetId(Long assetId) {
		this.assetId = assetId;
	}

	@CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
