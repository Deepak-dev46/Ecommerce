package com.relevantz.ticketservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Internal Work Notes — visible only to support agents, never to end-users.
 * Maps to table: ticket_internal_notes
 */
@Entity
@Table(name = "ticket_internal_notes")
public class InternalNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long noteId;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    /** Agent who authored this note */
    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "author_name")
    private String authorName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /** Raw text of the note used to extract @mention tokens */
    @Column(name = "mention_user_ids", columnDefinition = "TEXT")
    private String mentionUserIds;   // comma-separated agent IDs e.g. "3,7,12"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters / Setters ──────────────────────────────────────────────────────

    public Long getNoteId() { return noteId; }
    public void setNoteId(Long noteId) { this.noteId = noteId; }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMentionUserIds() { return mentionUserIds; }
    public void setMentionUserIds(String mentionUserIds) { this.mentionUserIds = mentionUserIds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
