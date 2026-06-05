package com.rvz.actionservice.repository;

import com.rvz.actionservice.entity.TicketAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketActionRepository extends JpaRepository<TicketAction, Long> {
    List<TicketAction> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
