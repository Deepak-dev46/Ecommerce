package com.relevantz.ticketservice.dto;

import jakarta.validation.constraints.NotNull;

public class SubmitTicketRequest {
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    public SubmitTicketRequest() {}
    public Long getTicketId()          { return ticketId; }
    public void setTicketId(Long v)    { this.ticketId = v; }
}
