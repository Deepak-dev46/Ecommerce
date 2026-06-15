package com.rvz.serviceeverz.dto.response;

import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.ChangePriority;
import com.rvz.serviceeverz.enums.ChangeStatus;
import com.rvz.serviceeverz.enums.ChangeType;

public class ChangePlanResponse {
	private Long id;
	private String changeNumber, title, description, managerComment;
	private ChangeType changeType;
	private ChangePriority priority;
	private ChangeStatus status;
	private LocalDateTime plannedStartTime, plannedEndTime, submittedAt, decisionAt, createdAt, updatedAt;
	private Long createdBySpId;
	private Integer revisionCount;
	private String createdBySpName;
	private String createdBySpEmail;

	public ChangePlanResponse() {}

	public Long getId() { return id; } public void setId(Long v) { id = v; }
	public String getChangeNumber() { return changeNumber; } public void setChangeNumber(String v) { changeNumber = v; }
	public String getTitle() { return title; } public void setTitle(String v) { title = v; }
	public String getDescription() { return description; } public void setDescription(String v) { description = v; }
	public String getManagerComment() { return managerComment; } public void setManagerComment(String v) { managerComment = v; }
	public ChangeType getChangeType() { return changeType; } public void setChangeType(ChangeType v) { changeType = v; }
	public ChangePriority getPriority() { return priority; } public void setPriority(ChangePriority v) { priority = v; }
	public ChangeStatus getStatus() { return status; } public void setStatus(ChangeStatus v) { status = v; }
	public LocalDateTime getPlannedStartTime() { return plannedStartTime; } public void setPlannedStartTime(LocalDateTime v) { plannedStartTime = v; }
	public LocalDateTime getPlannedEndTime() { return plannedEndTime; } public void setPlannedEndTime(LocalDateTime v) { plannedEndTime = v; }
	public Long getCreatedBySpId() { return createdBySpId; } public void setCreatedBySpId(Long v) { createdBySpId = v; }
	public LocalDateTime getSubmittedAt() { return submittedAt; } public void setSubmittedAt(LocalDateTime v) { submittedAt = v; }
	public LocalDateTime getDecisionAt() { return decisionAt; } public void setDecisionAt(LocalDateTime v) { decisionAt = v; }
	public Integer getRevisionCount() { return revisionCount; } public void setRevisionCount(Integer v) { revisionCount = v; }
	public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { createdAt = v; }
	public LocalDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(LocalDateTime v) { updatedAt = v; }
	public String getCreatedBySpName() { return createdBySpName; } public void setCreatedBySpName(String v) { createdBySpName = v; }
	public String getCreatedBySpEmail() { return createdBySpEmail; } public void setCreatedBySpEmail(String v) { createdBySpEmail = v; }
}
