package com.rvz.masterdataservice.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectResponse {

    private Long id;
    private String projectCode;
    private String name;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String projectCategory;
    private Long resourceOwnerId;
    private Long l1ManagerId;
    private Long l2ManagerId;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProjectResponse() {}

    // ── EXISTING getters/setters – NOT MODIFIED ─────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getProjectCategory() { return projectCategory; }
    public void setProjectCategory(String projectCategory) { this.projectCategory = projectCategory; }

    public Long getResourceOwnerId() { return resourceOwnerId; }
    public void setResourceOwnerId(Long resourceOwnerId) { this.resourceOwnerId = resourceOwnerId; }

    public Long getL1ManagerId() { return l1ManagerId; }
    public void setL1ManagerId(Long l1ManagerId) { this.l1ManagerId = l1ManagerId; }

    public Long getL2ManagerId() { return l2ManagerId; }
    public void setL2ManagerId(Long l2ManagerId) { this.l2ManagerId = l2ManagerId; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ── NEW alias getters – Added for email-ticket-service (Story 22) ────────
    // The email-ticket-service resolves projectId via key "projectId"
    // and matches project by key "projectTitle".
    // These aliases make the JSON response include both field names
    // so the existing getId()/getName() and the email service both work.

    /** Alias for email-ticket-service: resolveProjectId looks up "projectId" in the response map. */
    public Long getProjectId() { return id; }

    /** Alias for email-ticket-service: resolveProjectId matches on "projectTitle" in the response map. */
    public String getProjectTitle() { return name; }
}
