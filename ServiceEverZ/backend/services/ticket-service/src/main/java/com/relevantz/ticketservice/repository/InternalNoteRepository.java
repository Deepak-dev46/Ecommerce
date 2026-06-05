package com.relevantz.ticketservice.repository;

import com.relevantz.ticketservice.model.InternalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternalNoteRepository extends JpaRepository<InternalNote, Long> {

    List<InternalNote> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
