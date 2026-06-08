package com.rvz.assignmentservice.repository;

import com.rvz.assignmentservice.entity.TicketAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketAssignmentRepository extends JpaRepository<TicketAssignment, Long> {
    Optional<TicketAssignment> findByTicketId(Long ticketId);
    List<TicketAssignment> findBySupportPersonId(Long supportPersonId);
    List<TicketAssignment> findByStatus(String status);
}

