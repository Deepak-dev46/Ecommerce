package com.rvz.actionservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TicketActionRequest {

    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotBlank(message = "Action by is required")
    private String actionBy;

    @NotBlank(message = "Comments are required")
    private String comments;

    
    /**
     * NEW (nullable, backward-compatible):
     * SLA policy ID associated with the ticket.
     * Required only for resolveTicket() so auto-close picks the right config.
     * All existing callers (working, comment, close, additionalInput) may omit it.
     */
    private Long slaId;

    public TicketActionRequest() {}

    public Long   getTicketId()               { return ticketId; }
    public void   setTicketId(Long ticketId)  { this.ticketId = ticketId; }

    public String getActionBy()               { return actionBy; }
    public void   setActionBy(String actionBy){ this.actionBy = actionBy; }

    public String getComments()               { return comments; }
    public void   setComments(String comments){ this.comments = comments; }

    public Long   getSlaId()                  { return slaId; }
    public void   setSlaId(Long slaId)        { this.slaId = slaId; }
}
