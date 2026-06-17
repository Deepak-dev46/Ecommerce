package com.relevantz.ticketservice.model;
//Added by Team - A
/**
 * Supported ticket relationship types (Feature 3 — Link Related Tickets).
 *
 * DUPLICATE   – sourceTicketId is an exact copy of targetTicketId.
 * RELATED     – tickets are about similar topics but are independent.
 * DEPENDS_ON  – sourceTicketId cannot be resolved until targetTicketId is fixed.
 * PARENT_CHILD – sourceTicketId is a child of targetTicketId (Feature 2 – Split).
 */
public enum RelationshipType {
    DUPLICATE,
    RELATED,
    DEPENDS_ON,
    PARENT_CHILD
}
