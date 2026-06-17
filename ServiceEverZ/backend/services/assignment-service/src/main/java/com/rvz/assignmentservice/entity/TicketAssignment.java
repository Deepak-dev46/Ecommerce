package com.rvz.assignmentservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_assignments")
public class TicketAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;
    @Column(name = "ticket_id")
    private Long ticketId;
    @Column(name = "support_person_id")
    private Long supportPersonId;
    @Column(name = "support_person_name")
    private String supportPersonName;
    @Column(name = "priority")
    private String priority;
    @Column(name = "estimated_hours")
    private Double estimatedHours;
    @Column(name = "response_time_hours")
    private Double responseTimeHours;
    @Column(name = "remaining_hours")
    private Double remainingHours;
    @Column(name = "status")
    private String status;
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    @Column(name = "reassigned")
    private Boolean reassigned;

    public TicketAssignment() {}
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public Long getSupportPersonId() { return supportPersonId; }
    public void setSupportPersonId(Long supportPersonId) { this.supportPersonId = supportPersonId; }
    public String getSupportPersonName() { return supportPersonName; }
    public void setSupportPersonName(String supportPersonName) { this.supportPersonName = supportPersonName; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Double getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Double estimatedHours) { this.estimatedHours = estimatedHours; }
    public Double getResponseTimeHours() { return responseTimeHours; }
    public void setResponseTimeHours(Double responseTimeHours) { this.responseTimeHours = responseTimeHours; }
    public Double getRemainingHours() { return remainingHours; }
    public void setRemainingHours(Double remainingHours) { this.remainingHours = remainingHours; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public Boolean getReassigned() { return reassigned; }
    public void setReassigned(Boolean reassigned) { this.reassigned = reassigned; }
}
