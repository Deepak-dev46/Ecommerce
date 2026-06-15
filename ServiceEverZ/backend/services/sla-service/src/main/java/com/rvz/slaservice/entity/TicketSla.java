package com.rvz.slaservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_sla")
public class TicketSla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sla_id")
    private int slaId;
    @Column(name = "ticket_id")
    private Long ticketId;
    @Column(name = "status")
    private String status;
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
    private Long totalPausedMinutes;
    @Column(name = "breached")
    private Boolean breached;

    public TicketSla() {}
    public int getSlaId() { return slaId; }
    public void setSlaId(int slaId) { this.slaId = slaId; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
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
}
