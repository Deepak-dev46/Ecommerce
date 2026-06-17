package com.relevantz.ticketservice.model;
 
import java.time.LocalDateTime;
 
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "ticket_attachments")
public class TicketAttachments {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachmentId")
    private Long attachmentID;
 
    @Column(name = "ticket_id")
    private Long ticketId;
 
    private String filename;
 
    // Stores Base64 encoded file content in MySQL LONGTEXT (~4GB max)
    @Lob
    @Column(name = "file", columnDefinition = "LONGTEXT")
    private String file;
 
    // e.g. "image/png", "application/pdf"
    @Column(name = "mime_type", length = 100)
    private String mimeType;
 
    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;
 
    private LocalDateTime createdAt;
 
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
 
    public Long getAttachmentID()               { return attachmentID; }
    public void setAttachmentID(Long v)         { this.attachmentID = v; }
    public Long getTicketId()                   { return ticketId; }
    public void setTicketId(Long v)             { this.ticketId = v; }
    public String getFilename()                 { return filename; }
    public void setFilename(String v)           { this.filename = v; }
    public String getFile()                     { return file; }
    public void setFile(String v)               { this.file = v; }
    public String getMimeType()                 { return mimeType; }
    public void setMimeType(String v)           { this.mimeType = v; }
    public Long getFileSizeBytes()              { return fileSizeBytes; }
    public void setFileSizeBytes(Long v)        { this.fileSizeBytes = v; }
    public LocalDateTime getCreatedAt()         { return createdAt; }
    public void setCreatedAt(LocalDateTime v)   { this.createdAt = v; }
}
 