package com.relevantz.ticketservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketId;

    private String ticketNumber;

    private Long projectId;

	private boolean allowUserReply;

	
	
    // ✅ TYPE
    private Long typeId;
    private String typeName;

    // ✅ CATEGORY
    private Long categoryId;
    private String categoryName;

    // ✅ SUBCATEGORY
    private Long subCategoryId;
    private String subCategoryName;

    // ✅ ITEM (SERVICE)
    private Long itemId;
    private String itemName;

    // ✅ SLA + COMPLEXITY (FROM DB TABLES)
    private Long priorityId;   // FK → priority_sla
    private Long complexityId; // FK → complexity_effort

    // ✅ ENUM (for API readability)
    @Enumerated(EnumType.STRING)
    private Priority priority;

    // ✅ USER
    private Long userId;
    private String requesterName;

    @Enumerated(EnumType.STRING)
    private TicketMode mode;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;
    private String mobileNumber;

    private Boolean requiresResourceApproval = false;
    private Boolean draft = false;

    private Long assetId;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TicketStatus status;

    // ✅ SLA
    private LocalDateTime slaStartTime;
    private LocalDateTime slaDeadline;
    private Boolean slaPaused = false;
    private LocalDateTime slaPauseTime;
    private LocalDateTime slaResumeTime;

    public Boolean getSlaPaused() {
		return slaPaused;
	}

	public void setSlaPaused(Boolean slaPaused) {
		this.slaPaused = slaPaused;
	}

	public LocalDateTime getSlaPauseTime() {
		return slaPauseTime;
	}

	public void setSlaPauseTime(LocalDateTime slaPauseTime) {
		this.slaPauseTime = slaPauseTime;
	}

	public LocalDateTime getSlaResumeTime() {
		return slaResumeTime;
	}

	public void setSlaResumeTime(LocalDateTime slaResumeTime) {
		this.slaResumeTime = slaResumeTime;
	}

	private Boolean slaBreached = false;
    private Long responseTimeMinutes;
    private Long resolutionTimeMinutes;

    private String resolutionNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long createdBy;
    private Long updatedBy;

    private Long assigneeId;
    private String assigneeName;

    // ✅ LIFECYCLE

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }

        // SLA START
        this.slaStartTime = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ✅ GETTERS & SETTERS



public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public Long getTypeId() { return typeId; }
    public void setTypeId(Long typeId) { this.typeId = typeId; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getSubCategoryId() { return subCategoryId; }
    public void setSubCategoryId(Long subCategoryId) { this.subCategoryId = subCategoryId; }

    public String getSubCategoryName() { return subCategoryName; }
    public void setSubCategoryName(String subCategoryName) { this.subCategoryName = subCategoryName; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Long getPriorityId() { return priorityId; }
    public void setPriorityId(Long priorityId) { this.priorityId = priorityId; }

    public Long getComplexityId() { return complexityId; }
    public void setComplexityId(Long complexityId) { this.complexityId = complexityId; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public TicketMode getMode() { return mode; }
    public void setMode(TicketMode mode) { this.mode = mode; }

    public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getRequesterName() {
		return requesterName;
	}

	public void setRequesterName(String requesterName) {
		this.requesterName = requesterName;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getMobileNumber() {
		return mobileNumber;
	}

	public void setMobileNumber(String mobileNumber) {
		this.mobileNumber = mobileNumber;
	}

	public Boolean getRequiresResourceApproval() {
		return requiresResourceApproval;
	}

	public void setRequiresResourceApproval(Boolean requiresResourceApproval) {
		this.requiresResourceApproval = requiresResourceApproval;
	}

	public Boolean getDraft() {
		return draft;
	}

	public void setDraft(Boolean draft) {
		this.draft = draft;
	}

	public Long getAssetId() {
		return assetId;
	}

	public void setAssetId(Long assetId) {
		this.assetId = assetId;
	}

	public LocalDateTime getSlaStartTime() {
		return slaStartTime;
	}

	public void setSlaStartTime(LocalDateTime slaStartTime) {
		this.slaStartTime = slaStartTime;
	}

	public Boolean getSlaBreached() {
		return slaBreached;
	}

	public void setSlaBreached(Boolean slaBreached) {
		this.slaBreached = slaBreached;
	}

	public Long getResponseTimeMinutes() {
		return responseTimeMinutes;
	}

	public void setResponseTimeMinutes(Long responseTimeMinutes) {
		this.responseTimeMinutes = responseTimeMinutes;
	}

	public Long getResolutionTimeMinutes() {
		return resolutionTimeMinutes;
	}

	public void setResolutionTimeMinutes(Long resolutionTimeMinutes) {
		this.resolutionTimeMinutes = resolutionTimeMinutes;
	}

	public Long getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Long createdBy) {
		this.createdBy = createdBy;
	}

	public Long getUpdatedBy() {
		return updatedBy;
	}

	public void setUpdatedBy(Long updatedBy) {
		this.updatedBy = updatedBy;
	}

	public Long getAssigneeId() {
		return assigneeId;
	}

	public void setAssigneeId(Long assigneeId) {
		this.assigneeId = assigneeId;
	}

	public String getAssigneeName() {
		return assigneeName;
	}

	public void setAssigneeName(String assigneeName) {
		this.assigneeName = assigneeName;
	}

	public void setResolutionNotes(String resolutionNotes) {
		this.resolutionNotes = resolutionNotes;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public String getResolutionNotes() { return resolutionNotes; }

	public boolean isAllowUserReply() {
		return allowUserReply;
	}

	public void setAllowUserReply(boolean allowUserReply) {
		this.allowUserReply = allowUserReply;
	}
}

