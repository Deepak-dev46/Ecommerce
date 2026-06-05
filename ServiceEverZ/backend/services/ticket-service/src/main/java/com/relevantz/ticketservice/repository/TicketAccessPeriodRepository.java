package com.relevantz.ticketservice.repository;

import com.relevantz.ticketservice.model.TicketAccessPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TicketAccessPeriodRepository extends JpaRepository<TicketAccessPeriod, Long> {
    Optional<TicketAccessPeriod> findByTicketId(Long ticketId);
}
