package com.relevantz.ticketservice.dto;

import java.time.LocalDateTime;

import com.relevantz.ticketservice.model.TicketHistory;
import com.relevantz.ticketservice.model.TicketStatus;

public class HistoryResponse {

    private Long id;
    private Long ticketId;
    private TicketStatus status;
    private Long changedBy;
    private String remarks;
    private LocalDateTime createdAt;

    public static HistoryResponse from(TicketHistory h) {

        HistoryResponse r = new HistoryResponse();

        r.id = h.getHistoryId();      // ✅ FIXED
        r.ticketId = h.getTicketId(); // ✅ FIXED
        r.status = h.getStatus();     // ✅ FIXED
        r.changedBy = h.getChangedBy();
        r.remarks = h.getRemarks();   // ✅ FIXED
        r.createdAt = h.getCreatedAt(); // ✅ FIXED

        return r;
    }

    // ✅ GETTERS

    public Long getId() { return id; }
    public Long getTicketId() { return ticketId; }
    public TicketStatus getStatus() { return status; }
    public Long getChangedBy() { return changedBy; }
    public String getRemarks() { return remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}