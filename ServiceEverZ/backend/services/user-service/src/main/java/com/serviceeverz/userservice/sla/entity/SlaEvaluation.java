// src/main/java/com/serviceeverz/userservice/sla/entity/SlaEvaluation.java
package com.serviceeverz.userservice.sla.entity;
 
import com.serviceeverz.userservice.sla.enums.SlaStatus;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import com.serviceeverz.userservice.sla.enums.TicketStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
 
import java.time.LocalDateTime;
 
/**
 * Per-ticket SLA evaluation record.
 *
 * KEY UPGRADES:
 * - ticketStatus: OPEN → IN_PROGRESS → ON_HOLD ↔ RESUME → RESOLVED → CLOSED
 * - ON_HOLD pauses the SLA clock; totalPausedMinutes accumulates the dead time
 * - closureTime: set when status moves to RESOLVED — this is the "clock stop" moment
 * - escalationLevel: 0=none, 1=L1, 2=L2, 3=executive — increments on each breach
 * - escalatedToUserId: the user who received the escalation
 *
 * SLA clock = only counts time when status is OPEN or IN_PROGRESS
 * Effective elapsed = (now - ticketCreatedAt) - totalPausedMinutes
 */
@Entity
@Table(name = "sla_evaluations",
       indexes = {
           @Index(name = "idx_sla_ticket",        columnList = "ticketId"),
           @Index(name = "idx_sla_status",        columnList = "slaStatus"),
           @Index(name = "idx_sla_priority",      columnList = "priority"),
           @Index(name = "idx_sla_ticket_status", columnList = "ticketStatus")
       })
public class SlaEvaluation {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false, unique = true)
    private Long ticketId;
 
    @Column(nullable = false, length = 30)
    private String ticketNumber;
 
    @Column(length = 255)
    private String subject;
 
    private Long raisedByUserId;
 
    @Column(length = 120)
    private String raisedByName;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;
 
    @Column(nullable = false)
    private LocalDateTime ticketCreatedAt;
 
    // ── Lifecycle timestamps ───────────────────────────────────────────────────
 
    /** First agent response time. */
    private LocalDateTime firstResponseAt;
 
    /**
     * When ticket was put ON_HOLD (most recent pause start).
     * Null when not currently on hold.
     */
    private LocalDateTime pausedAt;
 
    /**
     * When ticket was most recently resumed from ON_HOLD.
     * Null if never resumed.
     */
    private LocalDateTime resumedAt;
 
    /**
     * CLOSURE TIME — set when status changes to RESOLVED.
     * This is the moment the SLA clock stops for resolution measurement.
     * This also starts the "confirmation window" before fully closing.
     */
    private LocalDateTime closureTime;
 
    /** When ticket was fully CLOSED (after RESOLVED confirmation). */
    private LocalDateTime resolvedAt;
 
    /**
     * Cumulative minutes the ticket spent ON_HOLD.
     * SLA deadlines are adjusted: effectiveDeadline = originalDeadline + totalPausedMinutes.
     */
    @Column(nullable = false)
    private long totalPausedMinutes = 0L;
 
    /** Whether the ticket is currently paused (ON_HOLD). */
    @Column(nullable = false)
    private boolean onHold = false;
 
    // ── Ticket status ─────────────────────────────────────────────────────────
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus ticketStatus = TicketStatus.OPEN;
 
    // ── SLA deadlines ─────────────────────────────────────────────────────────
 
    @Column(nullable = false)
    private LocalDateTime responseDeadline;
 
    @Column(nullable = false)
    private LocalDateTime resolutionDeadline;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlaStatus slaStatus = SlaStatus.ON_TRACK;
 
    @Column(nullable = false)
    private boolean resolutionBreached = false;
 
    @Column(nullable = false)
    private boolean responseBreached = false;
 
    // ── Escalation ────────────────────────────────────────────────────────────
 
    /**
     * Current escalation level.
     * 0 = not escalated
     * 1 = L1 escalation (first breach)
     * 2 = L2 escalation (second breach / still unresolved)
     * 3 = Executive / final escalation
     */
    @Column(nullable = false)
    private int escalationLevel = 0;
 
    /** User ID this ticket was escalated to (from SlaEscalationLevel config). */
    private Long escalatedToUserId;
 
    /** Display name of the escalation target (denormalized). */
    @Column(length = 120)
    private String escalatedToName;
 
    /** When the last escalation happened. */
    private LocalDateTime escalatedAt;
 
    // ── Audit ─────────────────────────────────────────────────────────────────
 
    @CreationTimestamp
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    private LocalDateTime updatedAt;
 
    // ── Getters & Setters ──────────────────────────────────────────────────────
 
    public Long getId() { return id; }
 
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
 
    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
 
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
 
    public Long getRaisedByUserId() { return raisedByUserId; }
    public void setRaisedByUserId(Long raisedByUserId) { this.raisedByUserId = raisedByUserId; }
 
    public String getRaisedByName() { return raisedByName; }
    public void setRaisedByName(String raisedByName) { this.raisedByName = raisedByName; }
 
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
 
    public LocalDateTime getTicketCreatedAt() { return ticketCreatedAt; }
    public void setTicketCreatedAt(LocalDateTime ticketCreatedAt) { this.ticketCreatedAt = ticketCreatedAt; }
 
    public LocalDateTime getFirstResponseAt() { return firstResponseAt; }
    public void setFirstResponseAt(LocalDateTime firstResponseAt) { this.firstResponseAt = firstResponseAt; }
 
    public LocalDateTime getPausedAt() { return pausedAt; }
    public void setPausedAt(LocalDateTime pausedAt) { this.pausedAt = pausedAt; }
 
    public LocalDateTime getResumedAt() { return resumedAt; }
    public void setResumedAt(LocalDateTime resumedAt) { this.resumedAt = resumedAt; }
 
    public LocalDateTime getClosureTime() { return closureTime; }
    public void setClosureTime(LocalDateTime closureTime) { this.closureTime = closureTime; }
 
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
 
    public long getTotalPausedMinutes() { return totalPausedMinutes; }
    public void setTotalPausedMinutes(long totalPausedMinutes) { this.totalPausedMinutes = totalPausedMinutes; }
 
    public boolean isOnHold() { return onHold; }
    public void setOnHold(boolean onHold) { this.onHold = onHold; }
 
    public TicketStatus getTicketStatus() { return ticketStatus; }
    public void setTicketStatus(TicketStatus ticketStatus) { this.ticketStatus = ticketStatus; }
 
    public LocalDateTime getResponseDeadline() { return responseDeadline; }
    public void setResponseDeadline(LocalDateTime responseDeadline) { this.responseDeadline = responseDeadline; }
 
    public LocalDateTime getResolutionDeadline() { return resolutionDeadline; }
    public void setResolutionDeadline(LocalDateTime resolutionDeadline) { this.resolutionDeadline = resolutionDeadline; }
 
    public SlaStatus getSlaStatus() { return slaStatus; }
    public void setSlaStatus(SlaStatus slaStatus) { this.slaStatus = slaStatus; }
 
    public boolean isResolutionBreached() { return resolutionBreached; }
    public void setResolutionBreached(boolean resolutionBreached) { this.resolutionBreached = resolutionBreached; }
 
    public boolean isResponseBreached() { return responseBreached; }
    public void setResponseBreached(boolean responseBreached) { this.responseBreached = responseBreached; }
 
    public int getEscalationLevel() { return escalationLevel; }
    public void setEscalationLevel(int escalationLevel) { this.escalationLevel = escalationLevel; }
 
    public Long getEscalatedToUserId() { return escalatedToUserId; }
    public void setEscalatedToUserId(Long escalatedToUserId) { this.escalatedToUserId = escalatedToUserId; }
 
    public String getEscalatedToName() { return escalatedToName; }
    public void setEscalatedToName(String escalatedToName) { this.escalatedToName = escalatedToName; }
 
    public LocalDateTime getEscalatedAt() { return escalatedAt; }
    public void setEscalatedAt(LocalDateTime escalatedAt) { this.escalatedAt = escalatedAt; }
 
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
 