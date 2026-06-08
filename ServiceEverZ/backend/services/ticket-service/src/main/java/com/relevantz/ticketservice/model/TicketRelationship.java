package com.relevantz.ticketservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
//This file addedd by team A

/**
 * Stores all ticket relationships:
 *   - DUPLICATE  : sourceTicketId is a duplicate of targetTicketId
 *   - RELATED    : two tickets are about similar topics (independent)
 *   - DEPENDS_ON : sourceTicketId cannot be resolved until targetTicketId is fixed
 *   - PARENT_CHILD : sourceTicketId is a child of targetTicketId (created via Split)
 *
 * Used by Features 1 (Merge), 3 (Link), and 4 (Hierarchy View).
 * Feature 2 (Split) also creates PARENT_CHILD rows when child tickets are generated.
 */
@Entity
@Table(name = "ticket_relationship",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_relationship",
           columnNames = {"source_ticket_id", "target_ticket_id", "relationship_type"}))
public class TicketRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_ticket_id", nullable = false)
    private Long sourceTicketId;

    @Column(name = "target_ticket_id", nullable = false)
    private Long targetTicketId;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_type", nullable = false, length = 20)
    private RelationshipType relationshipType;

    /** Free-text note about why the link was created (optional). */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Who created this relationship (support personnel user id). */
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId()                            { return id; }
    public void setId(Long id)                     { this.id = id; }

    public Long getSourceTicketId()                { return sourceTicketId; }
    public void setSourceTicketId(Long v)          { this.sourceTicketId = v; }

    public Long getTargetTicketId()                { return targetTicketId; }
    public void setTargetTicketId(Long v)          { this.targetTicketId = v; }

    public RelationshipType getRelationshipType()  { return relationshipType; }
    public void setRelationshipType(RelationshipType v) { this.relationshipType = v; }

    public String getNotes()                       { return notes; }
    public void setNotes(String notes)             { this.notes = notes; }

    public Long getCreatedBy()                     { return createdBy; }
    public void setCreatedBy(Long v)               { this.createdBy = v; }

    public LocalDateTime getCreatedAt()            { return createdAt; }
    public void setCreatedAt(LocalDateTime v)      { this.createdAt = v; }
}
