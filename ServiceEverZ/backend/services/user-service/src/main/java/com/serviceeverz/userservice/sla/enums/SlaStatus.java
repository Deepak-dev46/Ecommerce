// src/main/java/com/serviceeverz/userservice/sla/enums/SlaStatus.java
package com.serviceeverz.userservice.sla.enums;
 
/**
 * Real-time SLA status for a ticket evaluation.
 * Computed on-the-fly against policy deadlines.
 */
public enum SlaStatus {
    /** Ticket is within both response and resolution time. */
    ON_TRACK,
    /** Ticket is within deadlines but within 20% of the limit. */
    AT_RISK,
    /** Ticket has breached at least one SLA deadline. */
    BREACHED,
    /** Ticket was resolved within all SLA deadlines. */
    MET
}
 