package com.relevantz.ticketservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Stores "access required till" date for Git/SonarQube items. */
@Entity
@Table(name = "ticket_access_period")
public class TicketAccessPeriod {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id") private Long ticketId;
    @Column(name = "access_required_till") private LocalDateTime accessRequiredTill;

    public Long getId()                               { return id; }
    public void setId(Long v)                         { this.id = v; }
    public Long getTicketId()                         { return ticketId; }
    public void setTicketId(Long v)                   { this.ticketId = v; }
    public LocalDateTime getAccessRequiredTill()      { return accessRequiredTill; }
    public void setAccessRequiredTill(LocalDateTime v){ this.accessRequiredTill = v; }
}
