package com.relevantz.ticketservice.repository;

import com.relevantz.ticketservice.model.TicketAttachmentData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketAttachmentDataRepository extends JpaRepository<TicketAttachmentData, Long> {
    List<TicketAttachmentData> findByTicketId(Long ticketId);
}
