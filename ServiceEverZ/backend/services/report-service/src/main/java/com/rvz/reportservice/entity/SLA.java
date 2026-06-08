package com.rvz.reportservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_sla")
public class SLA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sla_id")
    private Long slaId;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "ticket_number")
    private String ticketNumber;

    @Column(name = "priority")
    private String priority;

    @Column(name = "status")
    private String status;

    @Column(name = "response_due_at")
    private LocalDateTime responseDueAt;

    @Column(name = "resolution_due_at")
    private LocalDateTime resolutionDueAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "paused_at")
    private LocalDateTime pausedAt;

    @Column(name = "resumed_at")
    private LocalDateTime resumedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(name = "total_paused_minutes")
    private Long totalPausedMinutes = 0L;

    @Column(name = "breached")
    private Boolean breached = false;

    @Column(name = "response_time_minutes")
    private Long responseTimeMinutes;

    @Column(name = "resolution_time_minutes")
    private Long resolutionTimeMinutes;

    @Column(name = "response_sla_met")
    private Boolean responseSLAMet;

    @Column(name = "resolution_sla_met")
    private Boolean resolutionSLAMet;

    @Column(name = "assignee_id")
    private Long assigneeId;

    @Column(name = "assignee_name")
    private String assigneeName;

    @Column(name = "category_name")
    private String categoryName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public SLA() {}

    public Long getSlaId() { return slaId; }
    public void setSlaId(Long slaId) { this.slaId = slaId; }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getResponseDueAt() { return responseDueAt; }
    public void setResponseDueAt(LocalDateTime responseDueAt) { this.responseDueAt = responseDueAt; }

    public LocalDateTime getResolutionDueAt() { return resolutionDueAt; }
    public void setResolutionDueAt(LocalDateTime resolutionDueAt) { this.resolutionDueAt = resolutionDueAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getPausedAt() { return pausedAt; }
    public void setPausedAt(LocalDateTime pausedAt) { this.pausedAt = pausedAt; }

    public LocalDateTime getResumedAt() { return resumedAt; }
    public void setResumedAt(LocalDateTime resumedAt) { this.resumedAt = resumedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) { this.dueAt = dueAt; }

    public Long getTotalPausedMinutes() { return totalPausedMinutes; }
    public void setTotalPausedMinutes(Long totalPausedMinutes) { this.totalPausedMinutes = totalPausedMinutes; }

    public Boolean getBreached() { return breached; }
    public void setBreached(Boolean breached) { this.breached = breached; }

    public Long getResponseTimeMinutes() { return responseTimeMinutes; }
    public void setResponseTimeMinutes(Long responseTimeMinutes) { this.responseTimeMinutes = responseTimeMinutes; }

    public Long getResolutionTimeMinutes() { return resolutionTimeMinutes; }
    public void setResolutionTimeMinutes(Long resolutionTimeMinutes) { this.resolutionTimeMinutes = resolutionTimeMinutes; }

    public Boolean getResponseSLAMet() { return responseSLAMet; }
    public void setResponseSLAMet(Boolean responseSLAMet) { this.responseSLAMet = responseSLAMet; }

    public Boolean getResolutionSLAMet() { return resolutionSLAMet; }
    public void setResolutionSLAMet(Boolean resolutionSLAMet) { this.resolutionSLAMet = resolutionSLAMet; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }

    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
