package com.rvz.approvalservice.entity;

public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    ON_HOLD,
    RESOLVED,
    CLOSED,
    REOPENED,
    CANCELLED,
    PENDING_USER_ACK,
    ASSIGNED,
    L1_APPROVED,
    L2_APPROVED// used in ticket_history only — not set on the ticket itself

}