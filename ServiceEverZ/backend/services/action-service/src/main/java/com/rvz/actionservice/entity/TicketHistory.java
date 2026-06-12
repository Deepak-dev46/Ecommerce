package com.rvz.actionservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Maps to the shared ticket_history table in the serviceeverz DB.
 * Action-service writes history entries for resolve / close / reopen
 * so the History tab shows the complete lifecycle.
 */
@Entity
@Table(name = "ticket_history")
public class TicketHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "status")
    private String status;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "changed_by_name")
    private String changedByName;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getHistoryId()                          { return historyId; }
    public void setHistoryId(Long historyId)            { this.historyId = historyId; }

    public Long getTicketId()                           { return ticketId; }
    public void setTicketId(Long ticketId)              { this.ticketId = ticketId; }

    public String getStatus()                           { return status; }
    public void setStatus(String status)                { this.status = status; }

    public Long getChangedBy()                          { return changedBy; }
    public void setChangedBy(Long changedBy)            { this.changedBy = changedBy; }

    public String getChangedByName()                    { return changedByName; }
    public void setChangedByName(String changedByName)  { this.changedByName = changedByName; }

    public String getRemarks()                          { return remarks; }
    public void setRemarks(String remarks)              { this.remarks = remarks; }

    public LocalDateTime getCreatedAt()                 { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt)   { this.createdAt = createdAt; }
}
