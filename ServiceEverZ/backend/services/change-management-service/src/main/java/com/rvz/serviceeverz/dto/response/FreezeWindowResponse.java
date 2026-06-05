package com.rvz.serviceeverz.dto.response;
import java.time.LocalDateTime;
 
public class FreezeWindowResponse {
    private Long id;
    private Long createdByManagerId;
    private String createdByManagerName;
    private String reason;
    private LocalDateTime freezeStart;
    private LocalDateTime freezeEnd;
    private LocalDateTime createdAt;
    private Boolean notificationSent;
 
    public FreezeWindowResponse() {}
 
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
 
    public Long getCreatedByManagerId() { return createdByManagerId; }
    public void setCreatedByManagerId(Long createdByManagerId) { this.createdByManagerId = createdByManagerId; }
 
    public String getCreatedByManagerName() { return createdByManagerName; }
    public void setCreatedByManagerName(String createdByManagerName) { this.createdByManagerName = createdByManagerName; }
 
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
 
    public LocalDateTime getFreezeStart() { return freezeStart; }
    public void setFreezeStart(LocalDateTime freezeStart) { this.freezeStart = freezeStart; }
 
    public LocalDateTime getFreezeEnd() { return freezeEnd; }
    public void setFreezeEnd(LocalDateTime freezeEnd) { this.freezeEnd = freezeEnd; }
 
    public Boolean getNotificationSent() { return notificationSent; }
    public void setNotificationSent(Boolean notificationSent) { this.notificationSent = notificationSent; }
 
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
 