package com.rvz.slaservice.repository;

import com.rvz.slaservice.entity.TicketSla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TicketSlaRepository extends JpaRepository<TicketSla, Integer> {
    Optional<TicketSla> findByTicketId(Long ticketId);
}
