package com.relevantz.ticketservice.dto;
 
import com.relevantz.ticketservice.model.CsatSurvey;
import com.relevantz.ticketservice.model.InternalNote;
import jakarta.validation.constraints.*;
 
import java.time.LocalDateTime;
import java.util.List;
 
// ══════════════════════════════════════════════════════════════════════════════
//  SUB-MODULE 01 — COLLABORATION (Internal Notes + @Mention)
// ══════════════════════════════════════════════════════════════════════════════
 
/**
 * Request payload to add an internal (work) note with optional @mentions.
 */
public class CollaborationDtos {
 
    // ── Add Internal Note Request ─────────────────────────────────────────────
 
    public static class AddInternalNoteRequest {
 
        @NotNull(message = "ticketId is required")
        private Long ticketId;
 
        @NotNull(message = "authorId is required")
        private Long authorId;
 
        @NotBlank(message = "authorName is required")
        private String authorName;
 
        @NotBlank(message = "content is required")
        private String content;
 
        /** IDs of support agents that were @mentioned (optional) */
        private List<Long> mentionedAgentIds;
 
        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
 
        public Long getAuthorId() { return authorId; }
        public void setAuthorId(Long authorId) { this.authorId = authorId; }
 
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
 
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
 
        public List<Long> getMentionedAgentIds() { return mentionedAgentIds; }
        public void setMentionedAgentIds(List<Long> mentionedAgentIds) {
            this.mentionedAgentIds = mentionedAgentIds;
        }
    }
 
    // ── Internal Note Response ────────────────────────────────────────────────
 
    public static class InternalNoteResponse {
        private Long noteId;
        private Long ticketId;
        private Long authorId;
        private String authorName;
        private String content;
        private List<Long> mentionedAgentIds;
        private LocalDateTime createdAt;
 
        public static InternalNoteResponse from(InternalNote note) {
            InternalNoteResponse r = new InternalNoteResponse();
            r.noteId = note.getNoteId();
            r.ticketId = note.getTicketId();
            r.authorId = note.getAuthorId();
            r.authorName = note.getAuthorName();
            r.content = note.getContent();
            r.createdAt = note.getCreatedAt();
            if (note.getMentionUserIds() != null && !note.getMentionUserIds().isBlank()) {
                r.mentionedAgentIds = java.util.Arrays.stream(note.getMentionUserIds().split(","))
                        .map(String::trim).filter(s -> !s.isEmpty())
                        .map(Long::parseLong).toList();
            }
            return r;
        }
 
        public Long getNoteId() { return noteId; }
        public Long getTicketId() { return ticketId; }
        public Long getAuthorId() { return authorId; }
        public String getAuthorName() { return authorName; }
        public String getContent() { return content; }
        public List<Long> getMentionedAgentIds() { return mentionedAgentIds; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
 
    // ── Agent Mention Lookup Response ─────────────────────────────────────────
    // Used by frontend @mention dropdown
 
    public static class AgentMentionDto {
        private Long userId;
        private String fullName;
        private String email;
 
        public AgentMentionDto(Long userId, String fullName, String email) {
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
        }
 
        public Long getUserId() { return userId; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
    }
}
 
 