package com.rvz.actionservice.autoclose.dto;

import com.rvz.actionservice.autoclose.entity.TicketAutoCloseState;
import com.rvz.actionservice.autoclose.enums.AutoCloseStatus;
import java.time.LocalDateTime;

public class TicketAutoCloseStateResponse {

    private Long id;
    private Long ticketId;
    private Long slaId;
    private AutoCloseStatus status;
    private LocalDateTime scheduledCloseAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime autoClosedAt;
    private int reopenCount;

    public static TicketAutoCloseStateResponse from(TicketAutoCloseState state) {
        TicketAutoCloseStateResponse r = new TicketAutoCloseStateResponse();
        r.id = state.getId();
        r.ticketId = state.getTicketId();
        r.slaId = state.getSlaId();
        r.status = state.getStatus();
        r.scheduledCloseAt = state.getScheduledCloseAt();
        r.resolvedAt = state.getResolvedAt();
        r.autoClosedAt = state.getAutoClosedAt();
        r.reopenCount = state.getReopenCount();
        return r;
    }

    public Long getId() { return id; }
    public Long getTicketId() { return ticketId; }
    public Long getSlaId() { return slaId; }
    public AutoCloseStatus getStatus() { return status; }
    public LocalDateTime getScheduledCloseAt() { return scheduledCloseAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public LocalDateTime getAutoClosedAt() { return autoClosedAt; }
    public int getReopenCount() { return reopenCount; }
}
