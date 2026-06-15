package com.relevantz.ticketservice.dto;

import jakarta.validation.constraints.NotBlank;

public class ReopenTicketRequest {

    @NotBlank(message = "Reason is required to reopen the ticket")
    private String reason;

    private String requestedBy;   // ✅ username
    private Long requestedById;   // ✅ user_id from DB (IMPORTANT)

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public Long getRequestedById() { return requestedById; }
    public void setRequestedById(Long requestedById) { this.requestedById = requestedById; }
}