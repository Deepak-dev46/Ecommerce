package com.relevantz.ticketservice.dto;

import jakarta.validation.constraints.NotBlank;

public class CancelTicketRequest {

    @NotBlank(message = "Cancellation reason is required")
    private String reason;

    private String cancelledBy;
    private Long cancelledById;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public Long getCancelledById() { return cancelledById; }
    public void setCancelledById(Long cancelledById) { this.cancelledById = cancelledById; }
}
