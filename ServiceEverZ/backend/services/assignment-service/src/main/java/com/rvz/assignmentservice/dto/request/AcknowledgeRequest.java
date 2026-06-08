package com.rvz.assignmentservice.dto.request;

import jakarta.validation.constraints.NotNull;

public class AcknowledgeRequest {
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;
    @NotNull(message = "Support person ID is required")
    private Long supportPersonId;

    public AcknowledgeRequest() {}
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public Long getSupportPersonId() { return supportPersonId; }
    public void setSupportPersonId(Long supportPersonId) { this.supportPersonId = supportPersonId; }
}
