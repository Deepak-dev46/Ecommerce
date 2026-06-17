package com.rvz.actionservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdditionalInputRequest {

    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotBlank(message = "Requested by is required")
    private String requestedBy;

    @NotBlank(message = "Comment is required")
    private String comment;

    public AdditionalInputRequest() {}

    public Long   getTicketId()               { return ticketId; }
    public void   setTicketId(Long ticketId)  { this.ticketId = ticketId; }

    public String getRequestedBy()                    { return requestedBy; }
    public void   setRequestedBy(String requestedBy)  { this.requestedBy = requestedBy; }

    public String getComment()                { return comment; }
    public void   setComment(String comment)  { this.comment = comment; }
}
