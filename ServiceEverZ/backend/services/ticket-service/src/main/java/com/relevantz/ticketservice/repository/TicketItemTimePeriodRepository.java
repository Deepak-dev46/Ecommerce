package com.relevantz.ticketservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.relevantz.ticketservice.model.TicketItemTimePeriod;

public interface TicketItemTimePeriodRepository
        extends JpaRepository<TicketItemTimePeriod, Long> {

    TicketItemTimePeriod findByTicketId(Long ticketId);
}