package com.relevantz.ticketservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "ticket_attachments")
public class TicketAttachments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attachmentID;

    @Column(name = "ticket_id")
    private Long ticketId;

    private String filename;
    private String file;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
    	
        this.createdAt = LocalDateTime.now();
    }

	public Long getAttachmentID() {
		return attachmentID;
	}

	public void setAttachmentID(Long attachmentID) {
		this.attachmentID = attachmentID;
	}

	public Long getTicketId() {
		return ticketId;
	}

	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public String getFile() {
		return file;
	}

	public void setFile(String file) {
		this.file = file;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
    
    
}
