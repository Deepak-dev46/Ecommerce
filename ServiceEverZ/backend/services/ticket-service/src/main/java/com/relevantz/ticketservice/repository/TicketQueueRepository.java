package com.relevantz.ticketservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.relevantz.ticketservice.model.TicketQueue;

public interface TicketQueueRepository
        extends JpaRepository<TicketQueue, Long> {

    List<TicketQueue> findByTicketId(Long ticketId);
}
