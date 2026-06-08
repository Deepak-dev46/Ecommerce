// src/main/java/com/serviceeverz/userservice/sla/dto/SlaEvaluationRequest.java
package com.serviceeverz.userservice.sla.dto;
 
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import com.serviceeverz.userservice.sla.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
 
import java.time.LocalDateTime;
 
public class SlaEvaluationRequest {
 
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;
 
    @NotNull(message = "Ticket number is required")
    private String ticketNumber;
 
    private String subject;
    private Long raisedByUserId;
    private String raisedByName;
 
    @NotNull(message = "Priority is required")
    private TicketPriority priority;
 
    @NotNull(message = "Ticket creation time is required")
    private LocalDateTime ticketCreatedAt;
 
    /** Set when agent first responds. */
    private LocalDateTime firstResponseAt;
 
    /** Set when ticket moves to RESOLVED — this is the closureTime. */
    private LocalDateTime resolvedAt;
 
    /**
     * New ticket status update.
     * ON_HOLD → pauses SLA clock
     * IN_PROGRESS → resumes if was ON_HOLD
     * RESOLVED → sets closureTime, stops clock
     * CLOSED → terminal
     */
    private TicketStatus ticketStatus;
 
    // ── Getters & Setters ─────────────────────────────────────────────────────
 
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
 
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
 
    public TicketStatus getTicketStatus() { return ticketStatus; }
    public void setTicketStatus(TicketStatus ticketStatus) { this.ticketStatus = ticketStatus; }
}
 