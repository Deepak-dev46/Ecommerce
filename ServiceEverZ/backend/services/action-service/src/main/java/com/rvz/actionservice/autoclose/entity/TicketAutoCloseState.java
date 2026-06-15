package com.rvz.actionservice.autoclose.entity;

import com.rvz.actionservice.autoclose.enums.AutoCloseStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Tracks the auto-close timer for every ticket that has ever been RESOLVED.
 * One row per ticketId (UPSERT semantics in the service layer).
 *
 * State machine:
 *   RESOLVED  → status=PENDING,    scheduledCloseAt = resolvedAt + configHours
 *   REOPENED  → status=CANCELLED,  scheduledCloseAt = null,  reopenCount++
 *   RESOLVED  → status=PENDING,    restartTimer() (covers multiple reopen/resolve cycles)
 *   Scheduler → status=CLOSED,     autoClosedAt = now
 */
@Entity
@Table(name = "ticket_auto_close_state")
public class TicketAutoCloseState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false, unique = true)
    private Long ticketId;

    /** SLA policy at the time of the last resolve; used to pick the right config. */
    @Column(name = "sla_id")
    private Long slaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AutoCloseStatus status;

    /** When the scheduler will auto-close this ticket. Null when CANCELLED. */
    @Column(name = "scheduled_close_at")
    private LocalDateTime scheduledCloseAt;

    /** Timestamp of the most recent RESOLVED transition. */
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /** Set by the scheduler when it successfully closes the ticket. */
    @Column(name = "auto_closed_at")
    private LocalDateTime autoClosedAt;

    /** Number of times this ticket has been reopened (diagnostic/audit). */
    @Column(name = "reopen_count", nullable = false)
    private int reopenCount = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TicketAutoCloseState() {}

    /** Constructor used when a ticket is first resolved. */
    public TicketAutoCloseState(Long ticketId, Long slaId, int autoCloseHours) {
        this.ticketId = ticketId;
        this.slaId = slaId;
        this.status = AutoCloseStatus.PENDING;
        this.resolvedAt = LocalDateTime.now();
        this.scheduledCloseAt = this.resolvedAt.plusHours(autoCloseHours);
        this.createdAt = LocalDateTime.now();
    }

    // ── Business methods ──────────────────────────────────────────────────────

    /** Restart timer from scratch (called when ticket is re-resolved after a reopen). */
    public void restartTimer(int autoCloseHours) {
        this.status = AutoCloseStatus.PENDING;
        this.resolvedAt = LocalDateTime.now();
        this.scheduledCloseAt = this.resolvedAt.plusHours(autoCloseHours);
        this.autoClosedAt = null;
        this.updatedAt = LocalDateTime.now();
    }

    /** Stop the timer (called immediately when ticket is reopened). */
    public void cancelTimer() {
        this.status = AutoCloseStatus.CANCELLED;
        this.scheduledCloseAt = null;
        this.reopenCount++;
        this.updatedAt = LocalDateTime.now();
    }

    /** Mark the ticket as auto-closed (called by the scheduler after success). */
    public void markClosed() {
        this.status = AutoCloseStatus.CLOSED;
        this.autoClosedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public Long getSlaId() { return slaId; }
    public void setSlaId(Long slaId) { this.slaId = slaId; }

    public AutoCloseStatus getStatus() { return status; }
    public void setStatus(AutoCloseStatus status) { this.status = status; }

    public LocalDateTime getScheduledCloseAt() { return scheduledCloseAt; }
    public void setScheduledCloseAt(LocalDateTime scheduledCloseAt) { this.scheduledCloseAt = scheduledCloseAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public LocalDateTime getAutoClosedAt() { return autoClosedAt; }
    public void setAutoClosedAt(LocalDateTime autoClosedAt) { this.autoClosedAt = autoClosedAt; }

    public int getReopenCount() { return reopenCount; }
    public void setReopenCount(int reopenCount) { this.reopenCount = reopenCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
