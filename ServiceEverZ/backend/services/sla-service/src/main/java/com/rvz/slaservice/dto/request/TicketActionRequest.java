package com.rvz.slaservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TicketActionRequest {
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;
    @NotBlank(message = "Reason is required")
    private String reason;

    public TicketActionRequest() {}
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
