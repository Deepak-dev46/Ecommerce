package com.rvz.slaservice.dto.response;

import java.time.LocalDateTime;

public class SlaResponse {
    private int slaId;
    private Long ticketId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime pausedAt;
    private LocalDateTime resumedAt;
    private LocalDateTime completedAt;
    private LocalDateTime dueAt;
    private Long totalPausedMinutes;
    private Boolean breached;

    public SlaResponse() {}
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
