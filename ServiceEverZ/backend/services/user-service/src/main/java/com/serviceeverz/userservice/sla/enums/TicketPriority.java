// src/main/java/com/serviceeverz/userservice/sla/enums/TicketPriority.java
package com.serviceeverz.userservice.sla.enums;
 
/**
 * Ticket priority levels — each maps to a different SLA policy.
 * CRITICAL → fastest SLA, INFORMATIONAL → slowest/optional SLA.
 */
public enum TicketPriority {
    HIGH,
    MEDIUM,
    LOW
}
 