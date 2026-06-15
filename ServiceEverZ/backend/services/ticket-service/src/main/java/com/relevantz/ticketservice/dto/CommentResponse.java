package com.relevantz.ticketservice.dto;

import java.time.LocalDateTime;

import com.relevantz.ticketservice.model.TicketComment;

public class CommentResponse {

    private Long id;
    private Long ticketId;
    private Long userId;
    private String comment;
    private LocalDateTime createdAt;
    private String authorName;
    private String channel;
    
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getAuthorName() {
		return authorName;
	}

	public void setAuthorName(String authorName) {
		this.authorName = authorName;
	}

	public String getAuthRole() {
		return authRole;
	}

	public void setAuthRole(String authRole) {
		this.authRole = authRole;
	}

	private String authRole;

    public static CommentResponse from(TicketComment c) {

        CommentResponse r = new CommentResponse();

        r.id = c.getCommentID();       // ✅ FIXED
        r.ticketId = c.getTicketId();  // ✅ FIXED
        r.userId = c.getUserId();      // ✅ FIXED
        r.comment = c.getComment();    // ✅ FIXED
        r.createdAt = c.getCreatedAt();
        r.setAuthorName(c.getAuthorName());
        r.setAuthRole(c.getAuthorRole());
        r.setChannel(c.getChannel());
        
        

        return r;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getTicketId() {
		return ticketId;
	}

	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

  

}