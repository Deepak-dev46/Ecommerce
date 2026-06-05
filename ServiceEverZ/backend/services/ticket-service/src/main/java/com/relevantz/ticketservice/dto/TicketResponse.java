// package com.relevantz.ticketservice.dto;

// import java.time.LocalDateTime;
// import java.util.List;

// import com.relevantz.ticketservice.model.Priority;
// import com.relevantz.ticketservice.model.Ticket;
// import com.relevantz.ticketservice.model.TicketAttachments;
// import com.relevantz.ticketservice.model.TicketComment;
// import com.relevantz.ticketservice.model.TicketItemTimePeriod;
// import com.relevantz.ticketservice.model.TicketQueue;
// import com.relevantz.ticketservice.model.TicketStatus;

// public class TicketResponse {

// 	private Long id;
// 	private String ticketNumber;
// 	private String subject;
// 	private String description;

// 	// SERVICE HIERARCHY
// 	private String type;
// 	private String category;
// 	private String subCategory;
// 	private String item;

// 	private Priority priority;
// 	private TicketStatus status;

// 	private Long requesterId;
// 	private String requesterName;

// 	private Long assigneeId;
// 	private String assigneeName;

// 	private String resolutionNotes;
// 	private String location;
// 	private String mobileNumber;
// 	private LocalDateTime slaDeadline;

// 	private LocalDateTime createdAt;
// 	private LocalDateTime updatedAt;

// 	private Boolean slaBreached;
// 	private Long slaRemainingMinutes;
// 	private Boolean slaPaused;
// 	private LocalDateTime slaPauseTime;
// 	private LocalDateTime slaResumeTime;

// 	// CHILD DATA
// 	private List<AttachmentResponse> attachments;
// 	private List<CommentResponse> comments;
// 	private List<QueueResponse> queue;

// 	/**
// 	 * FIXED: approvals now comes from ticket_approvals (approval-service),
// 	 * not from ticket_queue. It's a single ApprovalResponse (not a list)
// 	 * but kept as List<ApprovalResponse> for backward-compatibility with frontend.
// 	 */
// 	private List<ApprovalResponse> approvals;
// 	private TimePeriodResponse timePeriod;

// 	// ── MAPPING: called from TicketService.getTicketById() ─────────────────────
// 	public static TicketResponse from(Ticket t,
// 			List<TicketAttachments> attachments,
// 			List<TicketComment> comments,
// 			List<TicketQueue> queue,
// 			List<TicketQueue> ignoredOldApprovals,  // kept for signature compatibility — ignored
// 			TicketItemTimePeriod timePeriod) {
// 		return from(t, attachments, comments, queue, ignoredOldApprovals, timePeriod, null);
// 	}

// 	/**
// 	 * FIXED overload: accepts a real ApprovalResponse fetched from approval-service.
// 	 */
// 	public static TicketResponse from(Ticket t,
// 			List<TicketAttachments> attachments,
// 			List<TicketComment> comments,
// 			List<TicketQueue> queue,
// 			List<TicketQueue> ignoredOldApprovals,
// 			TicketItemTimePeriod timePeriod,
// 			ApprovalResponse approvalFromService) {

// 		TicketResponse r = new TicketResponse();

// 		r.setId(t.getTicketId());
// 		r.setTicketNumber(t.getTicketNumber());
// 		r.setSubject(t.getSubject());
// 		r.setDescription(t.getDescription());

// 		r.setType(t.getTypeName());
// 		r.setCategory(t.getCategoryName());
// 		r.setSubCategory(t.getSubCategoryName());
// 		r.setItem(t.getItemName());

// 		r.setPriority(t.getPriority());
// 		r.setStatus(t.getStatus());

// 		r.setRequesterId(t.getUserId());
// 		r.setRequesterName(t.getRequesterName());

// 		r.setAssigneeId(t.getAssigneeId());
// 		r.setAssigneeName(t.getAssigneeName());

// 		r.setResolutionNotes(t.getResolutionNotes());
// 		r.setLocation(t.getLocation());
// 		r.setMobileNumber(t.getMobileNumber());
// 		r.setSlaDeadline(t.getSlaDeadline());

// 		r.setCreatedAt(t.getCreatedAt());
// 		r.setUpdatedAt(t.getUpdatedAt());

// 		r.setSlaPaused(t.getSlaPaused());
// 		r.setSlaPauseTime(t.getSlaPauseTime());
// 		r.setSlaResumeTime(t.getSlaResumeTime());

// 		if (t.getSlaDeadline() != null) {
// 			long remaining = java.time.Duration.between(LocalDateTime.now(), t.getSlaDeadline()).toMinutes();
// 			r.setSlaRemainingMinutes(remaining);
// 			r.setSlaBreached(remaining < 0);
// 		}

// 		r.setAttachments(attachments.stream().map(AttachmentResponse::from).toList());
// 		r.setComments(comments.stream().map(CommentResponse::from).toList());
// 		r.setQueue(queue.stream().map(QueueResponse::from).toList());

// 		// FIXED: use real approval data from ticket_approvals, not ticket_queue
// 		if (approvalFromService != null) {
// 			r.setApprovals(List.of(approvalFromService));
// 		} else {
// 			r.setApprovals(List.of());
// 		}

// 		if (timePeriod != null) {
// 			r.setTimePeriod(TimePeriodResponse.from(timePeriod));
// 		}

// 		return r;
// 	}

// 	// ── GETTERS & SETTERS ───────────────────────────────────────────────────────

// 	public Long getId() { return id; }
// 	public void setId(Long id) { this.id = id; }
// 	public String getTicketNumber() { return ticketNumber; }
// 	public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
// 	public String getSubject() { return subject; }
// 	public void setSubject(String subject) { this.subject = subject; }
// 	public String getDescription() { return description; }
// 	public void setDescription(String description) { this.description = description; }
// 	public String getType() { return type; }
// 	public void setType(String type) { this.type = type; }
// 	public String getCategory() { return category; }
// 	public void setCategory(String category) { this.category = category; }
// 	public String getSubCategory() { return subCategory; }
// 	public void setSubCategory(String subCategory) { this.subCategory = subCategory; }
// 	public String getItem() { return item; }
// 	public void setItem(String item) { this.item = item; }
// 	public Priority getPriority() { return priority; }
// 	public void setPriority(Priority priority) { this.priority = priority; }
// 	public TicketStatus getStatus() { return status; }
// 	public void setStatus(TicketStatus status) { this.status = status; }
// 	public Long getRequesterId() { return requesterId; }
// 	public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }
// 	public String getRequesterName() { return requesterName; }
// 	public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
// 	public Long getAssigneeId() { return assigneeId; }
// 	public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
// 	public String getAssigneeName() { return assigneeName; }
// 	public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
// 	public String getResolutionNotes() { return resolutionNotes; }
// 	public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
// 	public String getLocation() { return location; }
// 	public void setLocation(String location) { this.location = location; }
// 	public String getMobileNumber() { return mobileNumber; }
// 	public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
// 	public LocalDateTime getSlaDeadline() { return slaDeadline; }
// 	public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }
// 	public LocalDateTime getCreatedAt() { return createdAt; }
// 	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
// 	public LocalDateTime getUpdatedAt() { return updatedAt; }
// 	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
// 	public Boolean getSlaBreached() { return slaBreached; }
// 	public void setSlaBreached(Boolean slaBreached) { this.slaBreached = slaBreached; }
// 	public Long getSlaRemainingMinutes() { return slaRemainingMinutes; }
// 	public void setSlaRemainingMinutes(Long slaRemainingMinutes) { this.slaRemainingMinutes = slaRemainingMinutes; }
// 	public Boolean getSlaPaused() { return slaPaused; }
// 	public void setSlaPaused(Boolean slaPaused) { this.slaPaused = slaPaused; }
// 	public LocalDateTime getSlaPauseTime() { return slaPauseTime; }
// 	public void setSlaPauseTime(LocalDateTime slaPauseTime) { this.slaPauseTime = slaPauseTime; }
// 	public LocalDateTime getSlaResumeTime() { return slaResumeTime; }
// 	public void setSlaResumeTime(LocalDateTime slaResumeTime) { this.slaResumeTime = slaResumeTime; }
// 	public List<AttachmentResponse> getAttachments() { return attachments; }
// 	public void setAttachments(List<AttachmentResponse> attachments) { this.attachments = attachments; }
// 	public List<CommentResponse> getComments() { return comments; }
// 	public void setComments(List<CommentResponse> comments) { this.comments = comments; }
// 	public List<QueueResponse> getQueue() { return queue; }
// 	public void setQueue(List<QueueResponse> queue) { this.queue = queue; }
// 	public List<ApprovalResponse> getApprovals() { return approvals; }
// 	public void setApprovals(List<ApprovalResponse> approvals) { this.approvals = approvals; }
// 	public TimePeriodResponse getTimePeriod() { return timePeriod; }
// 	public void setTimePeriod(TimePeriodResponse timePeriod) { this.timePeriod = timePeriod; }
// }

package com.relevantz.ticketservice.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.relevantz.ticketservice.model.Priority;
import com.relevantz.ticketservice.model.Ticket;
import com.relevantz.ticketservice.model.TicketAttachments;
import com.relevantz.ticketservice.model.TicketComment;
import com.relevantz.ticketservice.model.TicketItemTimePeriod;
import com.relevantz.ticketservice.model.TicketQueue;
import com.relevantz.ticketservice.model.TicketStatus;

public class TicketResponse {

	private Long id;
	private String ticketNumber;
	private String subject;
	private String description;

	// SERVICE HIERARCHY
	private String type;
	private String category;
	private String subCategory;
	private String item;

	private Priority priority;
	private TicketStatus status;

	private Long requesterId;
	private String requesterName;

	private Long assigneeId;
	private String assigneeName;

	private String resolutionNotes;
	private String location;
	private String mobileNumber;
	private LocalDateTime slaDeadline;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
    private LocalDateTime accessRequiredTill;

	private Boolean slaBreached;
	private Long slaRemainingMinutes;
	private Boolean slaPaused;
	private LocalDateTime slaPauseTime;
	private LocalDateTime slaResumeTime;

	// CHILD DATA
	private List<AttachmentResponse> attachments;
	private List<CommentResponse> comments;
	private List<QueueResponse> queue;

	/**
	 * FIXED: approvals now comes from ticket_approvals (approval-service),
	 * not from ticket_queue. It's a single ApprovalResponse (not a list)
	 * but kept as List<ApprovalResponse> for backward-compatibility with frontend.
	 */
	private List<ApprovalResponse> approvals;
	private TimePeriodResponse timePeriod;

	// ── MAPPING: called from TicketService.getTicketById() ─────────────────────
	public static TicketResponse from(Ticket t,
			List<TicketAttachments> attachments,
			List<TicketComment> comments,
			List<TicketQueue> queue,
			List<TicketQueue> ignoredOldApprovals,  // kept for signature compatibility — ignored
			TicketItemTimePeriod timePeriod) {
		return from(t, attachments, comments, queue, ignoredOldApprovals, timePeriod, null);
	}

	/**
	 * FIXED overload: accepts a real ApprovalResponse fetched from approval-service.
	 */
	public static TicketResponse from(Ticket t,
			List<TicketAttachments> attachments,
			List<TicketComment> comments,
			List<TicketQueue> queue,
			List<TicketQueue> ignoredOldApprovals,
			TicketItemTimePeriod timePeriod,
			ApprovalResponse approvalFromService) {

		TicketResponse r = new TicketResponse();

		r.setId(t.getTicketId());
		r.setTicketNumber(t.getTicketNumber());
		r.setSubject(t.getSubject());
		r.setDescription(t.getDescription());

		r.setType(t.getTypeName());
		r.setCategory(t.getCategoryName());
		r.setSubCategory(t.getSubCategoryName());
		r.setItem(t.getItemName());

		r.setPriority(t.getPriority());
		r.setStatus(t.getStatus());

		r.setRequesterId(t.getUserId());
		r.setRequesterName(t.getRequesterName());

		r.setAssigneeId(t.getAssigneeId());
		r.setAssigneeName(t.getAssigneeName());

		r.setResolutionNotes(t.getResolutionNotes());
		r.setLocation(t.getLocation());
		r.setMobileNumber(t.getMobileNumber());
		r.setSlaDeadline(t.getSlaDeadline());

		r.setCreatedAt(t.getCreatedAt());
		r.setUpdatedAt(t.getUpdatedAt());

		r.setSlaPaused(t.getSlaPaused());
		r.setSlaPauseTime(t.getSlaPauseTime());
		r.setSlaResumeTime(t.getSlaResumeTime());

		if (t.getSlaDeadline() != null) {
			long remaining = java.time.Duration.between(LocalDateTime.now(), t.getSlaDeadline()).toMinutes();
			r.setSlaRemainingMinutes(remaining);
			r.setSlaBreached(remaining < 0);
		}

		r.setAttachments(attachments.stream().map(AttachmentResponse::from).toList());
		r.setComments(comments.stream().map(CommentResponse::from).toList());
		r.setQueue(queue.stream().map(QueueResponse::from).toList());

		// FIXED: use real approval data from ticket_approvals, not ticket_queue
		if (approvalFromService != null) {
			r.setApprovals(List.of(approvalFromService));
		} else {
			r.setApprovals(List.of());
		}

		if (timePeriod != null) {
			r.setTimePeriod(TimePeriodResponse.from(timePeriod));
		}

		return r;
	}

	// ── GETTERS & SETTERS ───────────────────────────────────────────────────────

    public LocalDateTime getAccessRequiredTill() {
		return accessRequiredTill;
	}

	public void setAccessRequiredTill(LocalDateTime accessRequiredTill) {
		this.accessRequiredTill = accessRequiredTill;
	}
	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getTicketNumber() { return ticketNumber; }
	public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
	public String getSubject() { return subject; }
	public void setSubject(String subject) { this.subject = subject; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public String getType() { return type; }
	public void setType(String type) { this.type = type; }
	public String getCategory() { return category; }
	public void setCategory(String category) { this.category = category; }
	public String getSubCategory() { return subCategory; }
	public void setSubCategory(String subCategory) { this.subCategory = subCategory; }
	public String getItem() { return item; }
	public void setItem(String item) { this.item = item; }
	public Priority getPriority() { return priority; }
	public void setPriority(Priority priority) { this.priority = priority; }
	public TicketStatus getStatus() { return status; }
	public void setStatus(TicketStatus status) { this.status = status; }
	public Long getRequesterId() { return requesterId; }
	public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }
	public String getRequesterName() { return requesterName; }
	public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
	public Long getAssigneeId() { return assigneeId; }
	public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
	public String getAssigneeName() { return assigneeName; }
	public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
	public String getResolutionNotes() { return resolutionNotes; }
	public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }
	public String getMobileNumber() { return mobileNumber; }
	public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
	public LocalDateTime getSlaDeadline() { return slaDeadline; }
	public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
	public Boolean getSlaBreached() { return slaBreached; }
	public void setSlaBreached(Boolean slaBreached) { this.slaBreached = slaBreached; }
	public Long getSlaRemainingMinutes() { return slaRemainingMinutes; }
	public void setSlaRemainingMinutes(Long slaRemainingMinutes) { this.slaRemainingMinutes = slaRemainingMinutes; }
	public Boolean getSlaPaused() { return slaPaused; }
	public void setSlaPaused(Boolean slaPaused) { this.slaPaused = slaPaused; }
	public LocalDateTime getSlaPauseTime() { return slaPauseTime; }
	public void setSlaPauseTime(LocalDateTime slaPauseTime) { this.slaPauseTime = slaPauseTime; }
	public LocalDateTime getSlaResumeTime() { return slaResumeTime; }
	public void setSlaResumeTime(LocalDateTime slaResumeTime) { this.slaResumeTime = slaResumeTime; }
	public List<AttachmentResponse> getAttachments() { return attachments; }
	public void setAttachments(List<AttachmentResponse> attachments) { this.attachments = attachments; }
	public List<CommentResponse> getComments() { return comments; }
	public void setComments(List<CommentResponse> comments) { this.comments = comments; }
	public List<QueueResponse> getQueue() { return queue; }
	public void setQueue(List<QueueResponse> queue) { this.queue = queue; }
	public List<ApprovalResponse> getApprovals() { return approvals; }
	public void setApprovals(List<ApprovalResponse> approvals) { this.approvals = approvals; }
	public TimePeriodResponse getTimePeriod() { return timePeriod; }
	public void setTimePeriod(TimePeriodResponse timePeriod) { this.timePeriod = timePeriod; }
}
