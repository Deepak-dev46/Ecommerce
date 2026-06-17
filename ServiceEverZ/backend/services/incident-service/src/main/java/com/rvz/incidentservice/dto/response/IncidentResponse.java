package com.rvz.incidentservice.dto.response;

import java.time.LocalDateTime;
import java.util.List;
/**
 * Response DTO returned to the frontend after creating / fetching an Incident.
 */
public class IncidentResponse {

      public static class AttachmentDto {
        private Long   attachmentID;
        private String filename;
        private String mimeType;
        private String file; // base64-encoded
 
        public Long   getAttachmentID()       { return attachmentID; }
        public void   setAttachmentID(Long v) { this.attachmentID = v; }
        public String getFilename()           { return filename; }
        public void   setFilename(String v)   { this.filename = v; }
        public String getMimeType()           { return mimeType; }
        public void   setMimeType(String v)   { this.mimeType = v; }
        public String getFile()               { return file; }
        public void   setFile(String v)       { this.file = v; }
    }
    private Long   incidentId;
    private String ticketNumber;
    private String ticketType;

    // Requester
    private Long   userId;
    private String requesterName;
    private String email;

    // Classification
    private Integer categoryId;
    private Integer subCategoryId;
    private String  categoryName;
    private String  subCategoryName;

    // Core
    private String subject;
    private String description;
    private String status;
    private String priority;

    // Incident-specific
    private String        breachByUser;
    private LocalDateTime occurredAt;
    private String        source;
    private String        incidentLocation;
    private String        officeLocation;
    private String        attachmentPath;
    private List<AttachmentDto> attachments;
public List<AttachmentDto> getAttachments()         { return attachments; }
public void setAttachments(List<AttachmentDto> v)   { this.attachments = v; }
    // Assignment
    private Long   assignedTo;
    private String assignedToName;

    private String resolutionNotes;
    public String getResolutionNotes()         { return resolutionNotes; }
    public void   setResolutionNotes(String v) { this.resolutionNotes = v; }

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IncidentResponse() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getTicketType() { return ticketType; }
    public void setTicketType(String ticketType) { this.ticketType = ticketType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public Integer getSubCategoryId() { return subCategoryId; }
    public void setSubCategoryId(Integer subCategoryId) { this.subCategoryId = subCategoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getSubCategoryName() { return subCategoryName; }
    public void setSubCategoryName(String subCategoryName) { this.subCategoryName = subCategoryName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getBreachByUser() { return breachByUser; }
    public void setBreachByUser(String breachByUser) { this.breachByUser = breachByUser; }

    public LocalDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(LocalDateTime occurredAt) { this.occurredAt = occurredAt; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }

    public String getOfficeLocation() { return officeLocation; }
    public void setOfficeLocation(String officeLocation) { this.officeLocation = officeLocation; }

    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
