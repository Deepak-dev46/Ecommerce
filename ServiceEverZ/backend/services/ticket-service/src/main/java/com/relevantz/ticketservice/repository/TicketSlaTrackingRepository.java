package com.relevantz.ticketservice.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.relevantz.ticketservice.model.TicketSlaTracking;

public interface TicketSlaTrackingRepository
        extends JpaRepository<TicketSlaTracking, Long> {

    Optional<TicketSlaTracking> findByTicketId(Long ticketId);
}