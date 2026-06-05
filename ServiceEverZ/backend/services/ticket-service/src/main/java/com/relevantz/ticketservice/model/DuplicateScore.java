package com.relevantz.ticketservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
//Added by Team- - A
/**
 * Persists the result of the duplicate-detection engine (Feature 1).
 *
 * When a new ticket is saved, the engine compares it against all recent open
 * tickets of the same user and stores a score row for every candidate pair
 * whose score is above the threshold.  Support personnel then reviews flagged
 * rows and chooses to merge or dismiss.
 *
 * score         : 0-100 composite similarity value
 * autoFlagged   : true when score ≥ THRESHOLD (default 70)
 * mergeConfirmed: set to true by support agent when they confirm the merge
 * dismissed     : set to true when the agent decides NOT to merge
 */
@Entity
@Table(name = "ticket_duplicate_score",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_duplicate_pair",
           columnNames = {"original_ticket_id", "duplicate_ticket_id"}))
public class DuplicateScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The older / surviving ticket. */
    @Column(name = "original_ticket_id", nullable = false)
    private Long originalTicketId;

    /** The newer ticket suspected to be a duplicate. */
    @Column(name = "duplicate_ticket_id", nullable = false)
    private Long duplicateTicketId;

    /** Composite similarity score (0–100). */
    @Column(nullable = false)
    private int score;

    /** True when the engine flagged this pair automatically. */
    @Column(name = "auto_flagged", nullable = false)
    private boolean autoFlagged = false;

    /** Set to true by support agent confirming the merge. */
    @Column(name = "merge_confirmed", nullable = false)
    private boolean mergeConfirmed = false;

    /** Set to true when the agent dismisses the suggestion. */
    @Column(nullable = false)
    private boolean dismissed = false;

    /** Who confirmed or dismissed (support agent user id). */
    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    public void onCreate() { this.createdAt = LocalDateTime.now(); }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId()                          { return id; }
    public Long getOriginalTicketId()            { return originalTicketId; }
    public void setOriginalTicketId(Long v)      { this.originalTicketId = v; }
    public Long getDuplicateTicketId()           { return duplicateTicketId; }
    public void setDuplicateTicketId(Long v)     { this.duplicateTicketId = v; }
    public int  getScore()                       { return score; }
    public void setScore(int v)                  { this.score = v; }
    public boolean isAutoFlagged()               { return autoFlagged; }
    public void setAutoFlagged(boolean v)        { this.autoFlagged = v; }
    public boolean isMergeConfirmed()            { return mergeConfirmed; }
    public void setMergeConfirmed(boolean v)     { this.mergeConfirmed = v; }
    public boolean isDismissed()                 { return dismissed; }
    public void setDismissed(boolean v)          { this.dismissed = v; }
    public Long getReviewedBy()                  { return reviewedBy; }
    public void setReviewedBy(Long v)            { this.reviewedBy = v; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public LocalDateTime getReviewedAt()         { return reviewedAt; }
    public void setReviewedAt(LocalDateTime v)   { this.reviewedAt = v; }
}
