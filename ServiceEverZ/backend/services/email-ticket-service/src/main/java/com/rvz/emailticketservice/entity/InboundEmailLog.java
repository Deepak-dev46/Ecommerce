package com.rvz.emailticketservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Audit log — every inbound email is recorded here for deduplication and tracing. */
@Entity
@Table(name = "inbound_email_log")
public class InboundEmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id", unique = true)
    private String messageId;

    @Column(name = "from_address")
    private String fromAddress;

    @Column(name = "raw_subject")
    private String rawSubject;

    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "ticket_number")
    private String ticketNumber;

    /** PROCESSING | SUCCESS | FAILED | VALIDATION_ERROR | DUPLICATE */
    @Column(name = "status")
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public InboundEmailLog() {}

    public Long          getId()                        { return id; }
    public String        getMessageId()                 { return messageId; }
    public void          setMessageId(String v)         { this.messageId = v; }
    public String        getFromAddress()               { return fromAddress; }
    public void          setFromAddress(String v)       { this.fromAddress = v; }
    public String        getRawSubject()                { return rawSubject; }
    public void          setRawSubject(String v)        { this.rawSubject = v; }
    public Long          getTicketId()                  { return ticketId; }
    public void          setTicketId(Long v)            { this.ticketId = v; }
    public String        getTicketNumber()              { return ticketNumber; }
    public void          setTicketNumber(String v)      { this.ticketNumber = v; }
    public String        getStatus()                    { return status; }
    public void          setStatus(String v)            { this.status = v; }
    public String        getErrorMessage()              { return errorMessage; }
    public void          setErrorMessage(String v)      { this.errorMessage = v; }
    public LocalDateTime getProcessedAt()               { return processedAt; }
    public void          setProcessedAt(LocalDateTime v){ this.processedAt = v; }
}