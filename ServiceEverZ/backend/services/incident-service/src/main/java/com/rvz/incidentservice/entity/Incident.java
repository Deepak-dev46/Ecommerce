package com.rvz.incidentservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Maps to the `incident` table.
 * Incidents are raised via the Service Catalog when the user selects
 * the "Incident" service type.  They skip L1/L2/ResourceOwner approval
 * and are assigned directly to a support personnel.
 */
@Entity
@Table(name = "incident")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "incident_id")
    private Long incidentId;

    // ── Ticket-like identifier ────────────────────────────────────────────────
    @Column(name = "ticket_number")
    private String ticketNumber;

    @Column(name = "ticket_type")
    private String ticketType;   // always "Incident"

    // ── Requester ─────────────────────────────────────────────────────────────
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "requester_name")
    private String requesterName;

    @Column(name = "email")
    private String email;

    // ── Classification ────────────────────────────────────────────────────────
    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "sub_category_id")
    private Integer subCategoryId;

    // ── Core fields ───────────────────────────────────────────────────────────
    @Column(name = "subject")
    private String subject;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status")
    private String status;        // New, In Progress, Resolved, Closed

    @Column(name = "priority")
    private String priority;      // High, Medium, Low

    // ── Incident-specific ─────────────────────────────────────────────────────
    @Column(name = "breach_by_user")
    private String breachByUser;

    @Column(name = "occurred_at")
    private LocalDateTime occurredAt;

    @Column(name = "source")
    private String source;        // Internal / External

    @Column(name = "incident_location")
    private String incidentLocation;

    @Column(name = "office_location")
    private String officeLocation;

    @Column(name = "attachment_path")
    private String attachmentPath;

    // ── Assignment ────────────────────────────────────────────────────────────
    @Column(name = "assigned_to")
    private Long assignedTo;      // support_personnel user_id (direct, no L1/L2)

    @Column(name = "assigned_to_name")
    private String assignedToName;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;
 
    public String getResolutionNotes()           { return resolutionNotes; }
    public void   setResolutionNotes(String v)   { this.resolutionNotes = v; }
    // ── Audit ─────────────────────────────────────────────────────────────────
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Transient helpers (populated at query time, not stored) ───────────────
    @Transient private String categoryName;
    @Transient private String subCategoryName;

    public Incident() {}

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

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getSubCategoryName() { return subCategoryName; }
    public void setSubCategoryName(String subCategoryName) { this.subCategoryName = subCategoryName; }
}
