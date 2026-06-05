package com.relevantz.ticketservice.dto;

import com.relevantz.ticketservice.model.RelationshipType;
import com.relevantz.ticketservice.model.TicketRelationship;
import com.relevantz.ticketservice.model.DuplicateScore;
import com.relevantz.ticketservice.model.TicketStatus;
import com.relevantz.ticketservice.model.Ticket;

import java.time.LocalDateTime;
import java.util.List;
//Added by Team-A
/**
 * All request / response DTOs for the Sprint-5 features live in this file to
 * keep the diff small.  They can be split into separate files later.
 *
 * Features covered:
 *   Feature 1 – Merge Duplicate Tickets
 *   Feature 2 – Split Complex Tickets into Child Tickets
 *   Feature 3 – Link Related Tickets
 *   Feature 4 – View Parent-Child Ticket Hierarchy
 */
public final class TicketRelationshipDtos {

    private TicketRelationshipDtos() {}

    // =========================================================================
    // Feature 3 — Link Related Tickets
    // =========================================================================

    /** Request body for POST /api/tickets/{id}/relationships */
    public static class LinkTicketsRequest {
        private Long targetTicketId;
        private RelationshipType relationshipType;
        private String notes;
        private Long createdBy;

        public Long getTargetTicketId()              { return targetTicketId; }
        public void setTargetTicketId(Long v)        { this.targetTicketId = v; }
        public RelationshipType getRelationshipType(){ return relationshipType; }
        public void setRelationshipType(RelationshipType v) { this.relationshipType = v; }
        public String getNotes()                     { return notes; }
        public void setNotes(String v)               { this.notes = v; }
        public Long getCreatedBy()                   { return createdBy; }
        public void setCreatedBy(Long v)             { this.createdBy = v; }
    }

    /** Response returned for a single relationship record. */
    public static class RelationshipResponse {
        private Long id;
        private Long sourceTicketId;
        private String sourceTicketNumber;
        private Long targetTicketId;
        private String targetTicketNumber;
        private RelationshipType relationshipType;
        private String notes;
        private LocalDateTime createdAt;

        public static RelationshipResponse from(TicketRelationship r,
                                                String sourceNum, String targetNum) {
            RelationshipResponse res = new RelationshipResponse();
            res.id                = r.getId();
            res.sourceTicketId    = r.getSourceTicketId();
            res.sourceTicketNumber = sourceNum;
            res.targetTicketId    = r.getTargetTicketId();
            res.targetTicketNumber = targetNum;
            res.relationshipType  = r.getRelationshipType();
            res.notes             = r.getNotes();
            res.createdAt         = r.getCreatedAt();
            return res;
        }

        public Long getId()                          { return id; }
        public Long getSourceTicketId()              { return sourceTicketId; }
        public String getSourceTicketNumber()        { return sourceTicketNumber; }
        public Long getTargetTicketId()              { return targetTicketId; }
        public String getTargetTicketNumber()        { return targetTicketNumber; }
        public RelationshipType getRelationshipType(){ return relationshipType; }
        public String getNotes()                     { return notes; }
        public LocalDateTime getCreatedAt()          { return createdAt; }
    }

    // =========================================================================
    // Feature 1 — Merge Duplicate Tickets
    // =========================================================================

    /** Response returned for a pending duplicate-score record. */
    public static class DuplicateFlagResponse {

        // Flat fields (kept for backward compat with DuplicateFlagsPage)
        private Long   id;
        private Long   originalTicketId;
        private String originalTicketNumber;
        private Long   duplicateTicketId;
        private String duplicateTicketNumber;
        private int    score;
        private LocalDateTime createdAt;

        // Fields expected by DuplicateReviewPage.jsx
        private int              similarityScore;
        private boolean          reviewed;
        private TicketSummary    originalTicket;
        private TicketSummary    duplicateTicket;
        private java.util.List<MatchSignal> matchSignals;

        /** Nested summary shown side-by-side in the review card. */
        public static class TicketSummary {
            public Long   id;
            public String ticketNumber;
            public String subject;
            public String requesterName;
            public String category;
            public String subCategory;
            public LocalDateTime createdAt;

            public static TicketSummary from(Ticket t) {
                if (t == null) return null;
                TicketSummary s = new TicketSummary();
                s.id            = t.getTicketId();
                s.ticketNumber  = t.getTicketNumber();
                s.subject       = t.getSubject();
                s.requesterName = t.getRequesterName();
                s.category      = t.getCategoryName();
                s.subCategory   = t.getSubCategoryName();
                s.createdAt     = t.getCreatedAt();
                return s;
            }
        }

        /** A single match signal row shown under each pair card. */
        public static class MatchSignal {
            public String  label;
            public boolean matched;
            public MatchSignal(String label, boolean matched) {
                this.label = label; this.matched = matched;
            }
        }

        /**
         * Build from a DuplicateScore + both Ticket entities.
         * @param d        the score record
         * @param original the surviving ticket
         * @param dup      the ticket flagged as duplicate
         */
        public static DuplicateFlagResponse from(
                DuplicateScore d, Ticket original, Ticket dup) {

            DuplicateFlagResponse r = new DuplicateFlagResponse();
            r.id                   = d.getId();
            r.originalTicketId     = d.getOriginalTicketId();
            r.originalTicketNumber = original != null ? original.getTicketNumber() : "?";
            r.duplicateTicketId    = d.getDuplicateTicketId();
            r.duplicateTicketNumber= dup != null ? dup.getTicketNumber() : "?";
            r.score                = d.getScore();
            r.similarityScore      = d.getScore();   // alias
            r.createdAt            = d.getCreatedAt();
            r.reviewed             = d.isMergeConfirmed() || d.isDismissed();
            r.originalTicket       = TicketSummary.from(original);
            r.duplicateTicket      = TicketSummary.from(dup);

            // Build match-signal list from field equality
            r.matchSignals = new java.util.ArrayList<>();
            if (original != null && dup != null) {
                r.matchSignals.add(new MatchSignal("Same Category",
                    original.getCategoryId() != null &&
                    original.getCategoryId().equals(dup.getCategoryId())));
                r.matchSignals.add(new MatchSignal("Same Sub-Category",
                    original.getSubCategoryId() != null &&
                    original.getSubCategoryId().equals(dup.getSubCategoryId())));
                r.matchSignals.add(new MatchSignal("Same Item",
                    original.getItemId() != null &&
                    original.getItemId().equals(dup.getItemId())));
                r.matchSignals.add(new MatchSignal("Same Asset",
                    original.getAssetId() != null &&
                    original.getAssetId().equals(dup.getAssetId())));
                r.matchSignals.add(new MatchSignal("Subject Match",
                    original.getSubject() != null && dup.getSubject() != null &&
                    original.getSubject().equalsIgnoreCase(dup.getSubject())));
            }
            return r;
        }

        public Long getId()                         { return id; }
        public Long getOriginalTicketId()           { return originalTicketId; }
        public String getOriginalTicketNumber()     { return originalTicketNumber; }
        public Long getDuplicateTicketId()          { return duplicateTicketId; }
        public String getDuplicateTicketNumber()    { return duplicateTicketNumber; }
        public int getScore()                       { return score; }
        public int getSimilarityScore()             { return similarityScore; }
        public boolean isReviewed()                 { return reviewed; }
        public TicketSummary getOriginalTicket()    { return originalTicket; }
        public TicketSummary getDuplicateTicket()   { return duplicateTicket; }
        public java.util.List<MatchSignal> getMatchSignals() { return matchSignals; }
        public LocalDateTime getCreatedAt()         { return createdAt; }
    }

    /** Request body for POST /api/tickets/merge */
    public static class MergeTicketsRequest {
        /** The ticket to keep as the active ticket. */
        private Long originalTicketId;
        /** The ticket to be closed as a duplicate. */
        private Long duplicateTicketId;
        /** Support agent user id. */
        private Long mergedBy;

        public Long getOriginalTicketId()    { return originalTicketId; }
        public void setOriginalTicketId(Long v) { this.originalTicketId = v; }
        public Long getDuplicateTicketId()   { return duplicateTicketId; }
        public void setDuplicateTicketId(Long v) { this.duplicateTicketId = v; }
        public Long getMergedBy()            { return mergedBy; }
        public void setMergedBy(Long v)      { this.mergedBy = v; }
    }

    // =========================================================================
    // Feature 2 — Split Complex Tickets
    // =========================================================================

    /** One task inside a split request. */
    public static class ChildTicketSpec {
        private String subject;
        private String description;
        private String assignedTeam;

        public String getSubject()          { return subject; }
        public void setSubject(String v)    { this.subject = v; }
        public String getDescription()      { return description; }
        public void setDescription(String v){ this.description = v; }
        public String getAssignedTeam()     { return assignedTeam; }
        public void setAssignedTeam(String v){ this.assignedTeam = v; }
    }

    /** Request body for POST /api/tickets/{id}/split */
    public static class SplitTicketRequest {
        private List<ChildTicketSpec> children;
        private Long splitBy;

        public List<ChildTicketSpec> getChildren() { return children; }
        public void setChildren(List<ChildTicketSpec> v) { this.children = v; }
        public Long getSplitBy()                   { return splitBy; }
        public void setSplitBy(Long v)             { this.splitBy = v; }
    }

    // =========================================================================
    // Feature 4 — View Parent-Child Ticket Hierarchy
    // =========================================================================

    /** One node in the hierarchy tree. */
    public static class HierarchyNode {
        private Long ticketId;
        private String ticketNumber;
        private String subject;
        private TicketStatus status;
        private String assigneeName;
        private RelationshipType relationToParent; // null for root
        private List<HierarchyNode> children;

        public Long getTicketId()                    { return ticketId; }
        public void setTicketId(Long v)              { this.ticketId = v; }
        public String getTicketNumber()              { return ticketNumber; }
        public void setTicketNumber(String v)        { this.ticketNumber = v; }
        public String getSubject()                   { return subject; }
        public void setSubject(String v)             { this.subject = v; }
        public TicketStatus getStatus()              { return status; }
        public void setStatus(TicketStatus v)        { this.status = v; }
        public String getAssigneeName()              { return assigneeName; }
        public void setAssigneeName(String v)        { this.assigneeName = v; }
        public RelationshipType getRelationToParent(){ return relationToParent; }
        public void setRelationToParent(RelationshipType v) { this.relationToParent = v; }
        public List<HierarchyNode> getChildren()     { return children; }
        public void setChildren(List<HierarchyNode> v){ this.children = v; }
    }
}
