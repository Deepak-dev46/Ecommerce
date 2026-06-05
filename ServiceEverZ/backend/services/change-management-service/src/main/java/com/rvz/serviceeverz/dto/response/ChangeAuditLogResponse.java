package com.rvz.serviceeverz.dto.response;

import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.ChangeStatus;
 
public class ChangeAuditLogResponse {
    private Long id;
    private Long performedByUserId;
    private String performedByUserName;
    private ChangeStatus fromStatus;
    private ChangeStatus toStatus;
    private String performedByRole;
    private String comment;
    private LocalDateTime performedAt;
 
    public ChangeAuditLogResponse() {}
 
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
 
    public Long getPerformedByUserId() { return performedByUserId; }
    public void setPerformedByUserId(Long performedByUserId) { this.performedByUserId = performedByUserId; }
 
    public String getPerformedByUserName() { return performedByUserName; }
    public void setPerformedByUserName(String performedByUserName) { this.performedByUserName = performedByUserName; }
 
    public ChangeStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(ChangeStatus fromStatus) { this.fromStatus = fromStatus; }
 
    public ChangeStatus getToStatus() { return toStatus; }
    public void setToStatus(ChangeStatus toStatus) { this.toStatus = toStatus; }
 
    public String getPerformedByRole() { return performedByRole; }
    public void setPerformedByRole(String performedByRole) { this.performedByRole = performedByRole; }
 
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
 
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
}
 