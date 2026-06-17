package com.rvz.actionservice.autoclose.enums;

/**
 * Lifecycle states of a ticket's auto-close timer.
 */
public enum AutoCloseStatus {
    /** Timer is active; scheduler will close the ticket when scheduledCloseAt is reached. */
    PENDING,
    /** Timer stopped because the ticket was reopened. */
    CANCELLED,
    /** Ticket was automatically closed by the scheduler. */
    CLOSED
}
