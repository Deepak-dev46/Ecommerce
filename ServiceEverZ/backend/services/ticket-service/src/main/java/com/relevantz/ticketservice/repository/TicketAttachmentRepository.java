package com.relevantz.ticketservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.relevantz.ticketservice.model.TicketAttachments;

import jakarta.transaction.Transactional;

public interface TicketAttachmentRepository
        extends JpaRepository<TicketAttachments, Long> {

    List<TicketAttachments> findByTicketId(Long ticketId);
    @Transactional
    void deleteByTicketId(Long ticketId);  
}