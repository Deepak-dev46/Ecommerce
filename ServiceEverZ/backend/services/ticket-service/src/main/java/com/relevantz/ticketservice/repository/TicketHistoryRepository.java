package com.relevantz.ticketservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.relevantz.ticketservice.model.TicketHistory;

@Repository
public interface TicketHistoryRepository
        extends JpaRepository<TicketHistory, Long> {

    // ✅ SIMPLE & CORRECT
    List<TicketHistory> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}

