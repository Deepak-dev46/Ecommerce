package com.rvz.reportservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "ticket_number", unique = true)
    private String ticketNumber;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private TicketPriority priority;

    @Column(name = "type_name")
    private String typeName;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "sub_category_name")
    private String subCategoryName;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "requester_name")
    private String requesterName;

    @Column(name = "assignee_id")
    private Long assigneeId;

    @Column(name = "assignee_name")
    private String assigneeName;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "sla_start_time")
    private LocalDateTime slaStartTime;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @Column(name = "sla_breached")
    private Boolean slaBreached = false;

    @Column(name = "sla_paused")
    private Boolean slaPaused = false;

    @Column(name = "response_time_minutes")
    private Long responseTimeMinutes;

    @Column(name = "resolution_time_minutes")
    private Long resolutionTimeMinutes;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "reopened_count")
    private Integer reopenedCount = 0;

    @Column(name = "requires_resource_approval")
    private Boolean requiresResourceApproval = false;

    @Column(name = "draft")
    private Boolean draft = false;

    @Column(name = "location")
    private String location;

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public Ticket() {}

    @PrePersist
    public void onCreate() {
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
        this.slaStartTime = LocalDateTime.now();
        if (this.reopenedCount == null) {
            this.reopenedCount = 0;
        }
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, ON_HOLD, RESOLVED, CLOSED, REOPENED, CANCELLED, PENDING_USER_ACK
    }

    public enum TicketPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getSubCategoryName() { return subCategoryName; }
    public void setSubCategoryName(String subCategoryName) { this.subCategoryName = subCategoryName; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }

    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public LocalDateTime getSlaStartTime() { return slaStartTime; }
    public void setSlaStartTime(LocalDateTime slaStartTime) { this.slaStartTime = slaStartTime; }

    public LocalDateTime getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }

    public Boolean getSlaBreached() { return slaBreached; }
    public void setSlaBreached(Boolean slaBreached) { this.slaBreached = slaBreached; }

    public Boolean getSlaPaused() { return slaPaused; }
    public void setSlaPaused(Boolean slaPaused) { this.slaPaused = slaPaused; }

    public Long getResponseTimeMinutes() { return responseTimeMinutes; }
    public void setResponseTimeMinutes(Long responseTimeMinutes) { this.responseTimeMinutes = responseTimeMinutes; }

    public Long getResolutionTimeMinutes() { return resolutionTimeMinutes; }
    public void setResolutionTimeMinutes(Long resolutionTimeMinutes) { this.resolutionTimeMinutes = resolutionTimeMinutes; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public Integer getReopenedCount() { return reopenedCount; }
    public void setReopenedCount(Integer reopenedCount) { this.reopenedCount = reopenedCount; }

    public Boolean getRequiresResourceApproval() { return requiresResourceApproval; }
    public void setRequiresResourceApproval(Boolean requiresResourceApproval) { this.requiresResourceApproval = requiresResourceApproval; }

    public Boolean getDraft() { return draft; }
    public void setDraft(Boolean draft) { this.draft = draft; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }
}
