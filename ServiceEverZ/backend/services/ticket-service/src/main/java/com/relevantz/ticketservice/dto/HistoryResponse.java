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
    private String createdByName;

    public static HistoryResponse from(TicketHistory h) {

        HistoryResponse r = new HistoryResponse();

        r.id = h.getHistoryId();      // ✅ FIXED
        r.ticketId = h.getTicketId(); // ✅ FIXED
        r.status = h.getStatus();     // ✅ FIXED
        r.changedBy = h.getChangedBy();
        r.remarks = h.getRemarks();   // ✅ FIXED
        r.createdAt = h.getCreatedAt(); // ✅ FIXED
        r.createdByName = h.getChangedByName();
        return r;
    }

    // ✅ GETTERS

    public Long getId() { return id; }
    public String getCreatedByName() {
		return createdByName;
	}

	public void setCreatedByName(String createdByName) {
		this.createdByName = createdByName;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}

	public void setStatus(TicketStatus status) {
		this.status = status;
	}

	public void setChangedBy(Long changedBy) {
		this.changedBy = changedBy;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Long getTicketId() { return ticketId; }
    public TicketStatus getStatus() { return status; }
    public Long getChangedBy() { return changedBy; }
    public String getRemarks() { return remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}