package com.rvz.serviceeverz.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

/**
 * DTO for the ticket-service GET /api/tickets/{id} response.
 *
 * Maps the fields we actually use in asset-service.
 * 
 * @JsonIgnoreProperties(ignoreUnknown = true) ensures forward-compatibility
 *                                     when ticket-service adds more fields
 *                                     (comments, queue, approvals, etc.).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TicketResponse {

	private Long id;
	private String ticketNumber;
	private String subject;
	private String description;
	private String type;
	private String category;
	private String subCategory;
	private String item;
	private String priority;
	private String status;

	/**
	 * The user who raised the ticket — was "createdByUserId" before, now
	 * "requesterId"
	 */
	private Long requesterId;
	private String requesterName;

	private Long assigneeId;
	private String assigneeName;

	private String location;
	private String mobileNumber;

	private String resolutionNotes;
	private LocalDateTime slaDeadline;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	private Boolean slaBreached;
	private Long slaRemainingMinutes;
	private Boolean slaPaused;
	private LocalDateTime slaPauseTime;
	private LocalDateTime slaResumeTime;

	/** Added by ticket-service: the date until which access is required */
	private LocalDateTime accessRequiredTill;

	// -------------------------------------------------------------------------
	// Getters & Setters
	// -------------------------------------------------------------------------

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTicketNumber() {
		return ticketNumber;
	}

	public void setTicketNumber(String ticketNumber) {
		this.ticketNumber = ticketNumber;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getSubCategory() {
		return subCategory;
	}

	public void setSubCategory(String subCategory) {
		this.subCategory = subCategory;
	}

	public String getItem() {
		return item;
	}

	public void setItem(String item) {
		this.item = item;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getRequesterId() {
		return requesterId;
	}

	public void setRequesterId(Long requesterId) {
		this.requesterId = requesterId;
	}

	public String getRequesterName() {
		return requesterName;
	}

	public void setRequesterName(String requesterName) {
		this.requesterName = requesterName;
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

	public String getResolutionNotes() {
		return resolutionNotes;
	}

	public void setResolutionNotes(String resolutionNotes) {
		this.resolutionNotes = resolutionNotes;
	}

	public LocalDateTime getSlaDeadline() {
		return slaDeadline;
	}

	public void setSlaDeadline(LocalDateTime slaDeadline) {
		this.slaDeadline = slaDeadline;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public Boolean getSlaBreached() {
		return slaBreached;
	}

	public void setSlaBreached(Boolean slaBreached) {
		this.slaBreached = slaBreached;
	}

	public Long getSlaRemainingMinutes() {
		return slaRemainingMinutes;
	}

	public void setSlaRemainingMinutes(Long slaRemainingMinutes) {
		this.slaRemainingMinutes = slaRemainingMinutes;
	}

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

	public LocalDateTime getAccessRequiredTill() {
		return accessRequiredTill;
	}

	public void setAccessRequiredTill(LocalDateTime accessRequiredTill) {
		this.accessRequiredTill = accessRequiredTill;
	}
}
