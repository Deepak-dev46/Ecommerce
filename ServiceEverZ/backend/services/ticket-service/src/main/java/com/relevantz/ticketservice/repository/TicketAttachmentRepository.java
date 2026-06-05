package com.relevantz.ticketservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.relevantz.ticketservice.model.TicketAttachments;

public interface TicketAttachmentRepository
        extends JpaRepository<TicketAttachments, Long> {

    List<TicketAttachments> findByTicketId(Long ticketId);
}