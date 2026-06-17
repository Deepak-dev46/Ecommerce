package com.rvz.assignmentservice.dto.response;

import java.time.LocalDateTime;

public class AssignmentResponse {
    private Long assignmentId;
    private Long ticketId;
    private Long supportPersonId;
    private String supportPersonName;
    private String priority;
    private Double estimatedHours;
    private Double responseTimeHours;
    private Double remainingHours;
    private String status;
    private LocalDateTime assignedAt;
    private LocalDateTime acknowledgedAt;
    private Boolean reassigned;

    public AssignmentResponse() {}
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
