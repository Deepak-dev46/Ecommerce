package com.relevantz.ticketservice.dto;

import com.relevantz.ticketservice.model.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTicketStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String resolutionNotes;

    // ✅ user name
    private String changedBy;

    // ✅ ADD THIS (IMPORTANT)
    private Long changedById;

    // ── Getters / Setters ─────────────────────────────

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public Long getChangedById() { return changedById; }
    public void setChangedById(Long changedById) {
        this.changedById = changedById;
    }
}