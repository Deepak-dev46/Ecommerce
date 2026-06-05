package com.relevantz.ticketservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ticket_item_time_period")
public class TicketItemTimePeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long timePeriodId;

    @Column(name = "ticket_id")
    private Long ticketId;

    private LocalDateTime softwareAccessRequiredTill;

	public Long getTimePeriodId() {
		return timePeriodId;
	}

	public void setTimePeriodId(Long timePeriodId) {
		this.timePeriodId = timePeriodId;
	}

	public Long getTicketId() {
		return ticketId;
	}

	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}

	public LocalDateTime getSoftwareAccessRequiredTill() {
		return softwareAccessRequiredTill;
	}

	public void setSoftwareAccessRequiredTill(LocalDateTime softwareAccessRequiredTill) {
		this.softwareAccessRequiredTill = softwareAccessRequiredTill;
	}
    
    
}
