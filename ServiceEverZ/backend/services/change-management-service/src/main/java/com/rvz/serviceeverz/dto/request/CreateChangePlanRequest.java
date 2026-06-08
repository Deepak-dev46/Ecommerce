package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.ChangePriority;
import com.rvz.serviceeverz.enums.ChangeType;

public class CreateChangePlanRequest {
	@NotBlank(message = "Title is required")
	private String title;
	private String description;
	private ChangeType changeType;
	private ChangePriority priority;
	@NotNull(message = "Planned start time is required")
	private LocalDateTime plannedStartTime;
	@NotNull(message = "Planned end time is required")
	private LocalDateTime plannedEndTime;
	@NotNull(message = "SP ID is required")
	private Long createdBySpId;

	public CreateChangePlanRequest() {}

	public String getTitle() { return title; }
	public void setTitle(String v) { title = v; }
	public String getDescription() { return description; }
	public void setDescription(String v) { description = v; }
	public ChangeType getChangeType() { return changeType; }
	public void setChangeType(ChangeType v) { changeType = v; }
	public ChangePriority getPriority() { return priority; }
	public void setPriority(ChangePriority v) { priority = v; }
	public LocalDateTime getPlannedStartTime() { return plannedStartTime; }
	public void setPlannedStartTime(LocalDateTime v) { plannedStartTime = v; }
	public LocalDateTime getPlannedEndTime() { return plannedEndTime; }
	public void setPlannedEndTime(LocalDateTime v) { plannedEndTime = v; }
	public Long getCreatedBySpId() { return createdBySpId; }
	public void setCreatedBySpId(Long v) { createdBySpId = v; }
}
