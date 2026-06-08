package com.relevantz.ticketservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Stores file-attachment metadata. Uses a distinct table name to avoid conflict. */
@Entity
@Table(name = "ticket_attachment_data")
public class TicketAttachmentData {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id")      private Long ticketId;
    @Column(name = "filename")       private String filename;
    @Column(name = "file_size_bytes") private Long fileSizeBytes;
    @Column(name = "created_at")     private LocalDateTime createdAt;

    public Long getId()                          { return id; }
    public void setId(Long v)                    { this.id = v; }
    public Long getTicketId()                    { return ticketId; }
    public void setTicketId(Long v)              { this.ticketId = v; }
    public String getFilename()                  { return filename; }
    public void setFilename(String v)            { this.filename = v; }
    public Long getFileSizeBytes()               { return fileSizeBytes; }
    public void setFileSizeBytes(Long v)         { this.fileSizeBytes = v; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime v)    { this.createdAt = v; }
}
