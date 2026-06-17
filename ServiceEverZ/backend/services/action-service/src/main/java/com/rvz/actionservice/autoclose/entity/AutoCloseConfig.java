package com.rvz.actionservice.autoclose.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Stores auto-close configuration at two levels:
 *   Global  : slaId IS NULL  — fallback when no SLA-specific config exists.
 *   SLA-specific : slaId NOT NULL — overrides global for that SLA policy.
 *
 * No changes to any existing table are needed; this is a brand-new table.
 */
@Entity
@Table(name = "auto_close_config")
public class AutoCloseConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** NULL = global default; non-null = SLA-policy-specific override. */
    @Column(name = "sla_id", unique = true)
    private Long slaId;

    /** Hours after RESOLVED before auto-close fires. */
    @Column(name = "auto_close_hours", nullable = false)
    private int autoCloseHours;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    /** Manager user ID who created/last updated this config. */
    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AutoCloseConfig() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSlaId() { return slaId; }
    public void setSlaId(Long slaId) { this.slaId = slaId; }

    public int getAutoCloseHours() { return autoCloseHours; }
    public void setAutoCloseHours(int autoCloseHours) { this.autoCloseHours = autoCloseHours; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
