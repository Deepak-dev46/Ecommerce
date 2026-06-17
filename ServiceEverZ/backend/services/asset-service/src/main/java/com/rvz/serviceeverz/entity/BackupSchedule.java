package com.rvz.serviceeverz.entity;

import java.time.LocalDate;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String scheduleName;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupStatus status;

    @Enumerated(EnumType.STRING)
    @Column
    private BackupFrequency frequency;

    @Column
    private Long assetId;

    @Column
    private Long retentionPolicyId;

    /** The future date on which this backup is scheduled to run. */
    @Column
    private LocalDate scheduledDate;

    /**
     * The next computed backup date (derived from scheduledDate + frequency).
     * Updated automatically whenever a backup is completed.
     */
    @Column
    private LocalDate nextBackupDate;

    /** Support Personnel who created this schedule. */
    @Column
    private Long createdBySpId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

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

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Long getRetentionPolicyId() { return retentionPolicyId; }
    public void setRetentionPolicyId(Long retentionPolicyId) { this.retentionPolicyId = retentionPolicyId; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public LocalDate getNextBackupDate() { return nextBackupDate; }
    public void setNextBackupDate(LocalDate nextBackupDate) { this.nextBackupDate = nextBackupDate; }

    public Long getCreatedBySpId() { return createdBySpId; }
    public void setCreatedBySpId(Long createdBySpId) { this.createdBySpId = createdBySpId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
