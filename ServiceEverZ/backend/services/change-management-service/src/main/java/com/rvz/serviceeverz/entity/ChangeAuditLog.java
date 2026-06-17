package com.rvz.serviceeverz.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.ChangeStatus;

@Entity
@Table(name = "change_audit_logs")
public class ChangeAuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_plan_id", nullable = false)
    private ChangePlan changePlan;

    @Enumerated(EnumType.STRING) @Column(name = "from_status") private ChangeStatus fromStatus;
    @Enumerated(EnumType.STRING) @Column(name = "to_status", nullable = false) private ChangeStatus toStatus;
    @Column(name = "performed_by_user_id", nullable = false) private Long performedByUserId;
    @Column(name = "performed_by_role", nullable = false) private String performedByRole;
    @Column(columnDefinition = "TEXT") private String comment;
    @Column(name = "performed_at", updatable = false) private LocalDateTime performedAt;

    @PrePersist protected void onCreate() { performedAt = LocalDateTime.now(); }

    public ChangeAuditLog() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public ChangePlan getChangePlan() { return changePlan; } public void setChangePlan(ChangePlan v) { this.changePlan = v; }
    public ChangeStatus getFromStatus() { return fromStatus; } public void setFromStatus(ChangeStatus v) { this.fromStatus = v; }
    public ChangeStatus getToStatus() { return toStatus; } public void setToStatus(ChangeStatus v) { this.toStatus = v; }
    public Long getPerformedByUserId() { return performedByUserId; } public void setPerformedByUserId(Long v) { this.performedByUserId = v; }
    public String getPerformedByRole() { return performedByRole; } public void setPerformedByRole(String v) { this.performedByRole = v; }
    public String getComment() { return comment; } public void setComment(String v) { this.comment = v; }
    public LocalDateTime getPerformedAt() { return performedAt; } public void setPerformedAt(LocalDateTime v) { this.performedAt = v; }
}
