package com.rvz.slaservice.dto.request;

import jakarta.validation.constraints.NotNull;

public class StartSlaRequest {
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;
    @NotNull(message = "SLA minutes is required")
    private Long slaMinutes;

    public StartSlaRequest() {}
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public Long getSlaMinutes() { return slaMinutes; }
    public void setSlaMinutes(Long slaMinutes) { this.slaMinutes = slaMinutes; }
}
