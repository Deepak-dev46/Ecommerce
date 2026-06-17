package com.relevantz.ticketservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.relevantz.ticketservice.model.TicketComment;

@Repository
public interface TicketCommentRepository
        extends JpaRepository<TicketComment, Long> {

    // ✅ Get comments by ticketId ordered by createdAt
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    List<TicketComment> findByTicketIdAndChannelOrderByCreatedAtAsc(Long ticketId, String channel);
}
