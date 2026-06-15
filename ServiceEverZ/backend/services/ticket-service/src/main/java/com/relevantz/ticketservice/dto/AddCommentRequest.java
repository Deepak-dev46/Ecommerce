package com.relevantz.ticketservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AddCommentRequest {

    @NotBlank(message = "Comment body is required")
    private String body;

    @NotNull(message = "AuthorId is required")
    private Long authorId;

    private String authorName;

    // "END_USER" or "SUPPORT"
    private String authorRole;

    private String channel;
    
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    // ── Getters / Setters ──────────────────────────────────────────────────────

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
}
