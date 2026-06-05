package com.rvz.serviceeverz.dto.request;
import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.ChangePriority;
import com.rvz.serviceeverz.enums.ChangeType;

public class UpdateChangePlanRequest {
    private String title, description;
    private ChangeType changeType;
    private ChangePriority priority;
    private LocalDateTime plannedStartTime, plannedEndTime;

    public UpdateChangePlanRequest() {}
    public String getTitle() { return title; } public void setTitle(String v) { title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { description = v; }
    public ChangeType getChangeType() { return changeType; } public void setChangeType(ChangeType v) { changeType = v; }
    public ChangePriority getPriority() { return priority; } public void setPriority(ChangePriority v) { priority = v; }
    public LocalDateTime getPlannedStartTime() { return plannedStartTime; } public void setPlannedStartTime(LocalDateTime v) { plannedStartTime = v; }
    public LocalDateTime getPlannedEndTime() { return plannedEndTime; } public void setPlannedEndTime(LocalDateTime v) { plannedEndTime = v; }
}
