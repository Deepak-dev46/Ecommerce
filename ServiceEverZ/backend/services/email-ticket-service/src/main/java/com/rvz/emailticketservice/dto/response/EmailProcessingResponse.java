package com.rvz.emailticketservice.dto.response;

/**
 * Returned after processing a single inbound email.
 */
public class EmailProcessingResponse {

    private String  ticketNumber;
    private Long    ticketId;
    private String  requesterEmail;
    private String  requesterName;
    private boolean acknowledgementSent;
    private String  message;

    public EmailProcessingResponse() {}

    public String  getTicketNumber()                          { return ticketNumber; }
    public void    setTicketNumber(String ticketNumber)       { this.ticketNumber = ticketNumber; }
    public Long    getTicketId()                              { return ticketId; }
    public void    setTicketId(Long ticketId)                 { this.ticketId = ticketId; }
    public String  getRequesterEmail()                        { return requesterEmail; }
    public void    setRequesterEmail(String requesterEmail)   { this.requesterEmail = requesterEmail; }
    public String  getRequesterName()                         { return requesterName; }
    public void    setRequesterName(String requesterName)     { this.requesterName = requesterName; }
    public boolean isAcknowledgementSent()                    { return acknowledgementSent; }
    public void    setAcknowledgementSent(boolean sent)       { this.acknowledgementSent = sent; }
    public String  getMessage()                               { return message; }
    public void    setMessage(String message)                 { this.message = message; }
}
