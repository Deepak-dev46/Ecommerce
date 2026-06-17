package com.rvz.incidentservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Payload sent from the frontend when raising an Incident ticket.
 * Incidents go directly to support personnel — no L1/L2/RO approval.
 */
public class CreateIncidentRequest {

    // ── Requester (auto-filled from logged-in user) ───────────────────────────
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Requester name is required")
    private String requesterName;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    // ── Classification ────────────────────────────────────────────────────────
    @NotNull(message = "Category is required")
    private Integer categoryId;

    @NotNull(message = "Sub-category is required")
    private Integer subCategoryId;

    // ── Core ──────────────────────────────────────────────────────────────────
    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    // status is always "New" on creation — set by server, not client
    // ticket_number is generated server-side

    @NotBlank(message = "Priority is required")
    private String priority;            // High, Medium, Low

    // ── Incident-specific ─────────────────────────────────────────────────────
    private String breachByUser;        // optional free-text

    private LocalDateTime occurredAt;   // when the incident happened

    @NotBlank(message = "Source is required")
    private String source;              // Internal / External

    private String incidentLocation;    // e.g. Floor 3 / Server Room

    private String officeLocation;      // e.g. HQ / Branch A

    private String attachmentPath;      // filename/path after upload

    // ── Helpers (names resolved from IDs in master-service, supplied by FE) ──
    private String categoryName;
    private String subCategoryName;

    public CreateIncidentRequest() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

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

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getSubCategoryName() { return subCategoryName; }
    public void setSubCategoryName(String subCategoryName) { this.subCategoryName = subCategoryName; }
}
