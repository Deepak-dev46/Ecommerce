package com.rvz.serviceeverz.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "freeze_windows")
public class FreezeWindow {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, columnDefinition = "TEXT") private String reason;
    @Column(name = "freeze_start", nullable = false) private LocalDateTime freezeStart;
    @Column(name = "freeze_end", nullable = false) private LocalDateTime freezeEnd;
    @Column(name = "created_by_manager_id", nullable = false) private Long createdByManagerId;
    @Column(name = "notification_sent") private Boolean notificationSent;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }

    public FreezeWindow() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getReason() { return reason; } public void setReason(String v) { this.reason = v; }
    public LocalDateTime getFreezeStart() { return freezeStart; } public void setFreezeStart(LocalDateTime v) { this.freezeStart = v; }
    public LocalDateTime getFreezeEnd() { return freezeEnd; } public void setFreezeEnd(LocalDateTime v) { this.freezeEnd = v; }
    public Long getCreatedByManagerId() { return createdByManagerId; } public void setCreatedByManagerId(Long v) { this.createdByManagerId = v; }
    public Boolean getNotificationSent() { return notificationSent; } public void setNotificationSent(Boolean v) { this.notificationSent = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}
