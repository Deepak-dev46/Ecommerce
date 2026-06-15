// src/main/java/com/serviceeverz/userservice/sla/enums/TicketStatus.java
package com.serviceeverz.userservice.sla.enums;
 
/**
 * Lifecycle status of a ticket.
 * Controls SLA timer: ON_HOLD / PAUSED pause the clock.
 * RESOLVED / CLOSED stop the clock and trigger final SLA evaluation.
 */
public enum TicketStatus {
    /** Ticket just created, no agent assigned yet. SLA clock running. */
    OPEN,
    /** Agent picked up, actively working. SLA clock running. */
    IN_PROGRESS,
    /** Waiting on customer / third party. SLA clock PAUSED. */
    ON_HOLD,
    /** Fix applied, pending confirmation. SLA clock stopped — closureTime set. */
    RESOLVED,
    /** Ticket fully closed. Terminal state. */
    CLOSED
}
 