package com.rvz.serviceeverz.dto.response;

import java.time.LocalDateTime;

/**
 * Lightweight view of a ticket returned by
 * GET /api/tickets/getAssignee/{spUserId}
 * filtered to IN_PROGRESS + category=Hardware only (for mapping creation).
 */
public class TicketSummaryResponse {
    private Long   id;
    private String ticketNumber;
    private String subject;
    private String category;
    private String subCategory;
    private String priority;
    private String status;
    private Long   requesterId;
    private String requesterName;
    private Long   assigneeId;
    private String assigneeName;
    private String location;
    private String mobileNumber;
    private LocalDateTime slaDeadline;
    private LocalDateTime createdAt;
    private boolean slaBreached;

    // ── Getters & Setters ──────────────────────────────────────────
    public Long getId()                    { return id; }
    public void setId(Long v)              { id = v; }
    public String getTicketNumber()        { return ticketNumber; }
    public void setTicketNumber(String v)  { ticketNumber = v; }
    public String getSubject()             { return subject; }
    public void setSubject(String v)       { subject = v; }
    public String getCategory()            { return category; }
    public void setCategory(String v)      { category = v; }
    public String getSubCategory()         { return subCategory; }
    public void setSubCategory(String v)   { subCategory = v; }
    public String getPriority()            { return priority; }
    public void setPriority(String v)      { priority = v; }
    public String getStatus()              { return status; }
    public void setStatus(String v)        { status = v; }
    public Long getRequesterId()           { return requesterId; }
    public void setRequesterId(Long v)     { requesterId = v; }
    public String getRequesterName()       { return requesterName; }
    public void setRequesterName(String v) { requesterName = v; }
    public Long getAssigneeId()            { return assigneeId; }
    public void setAssigneeId(Long v)      { assigneeId = v; }
    public String getAssigneeName()        { return assigneeName; }
    public void setAssigneeName(String v)  { assigneeName = v; }
    public String getLocation()            { return location; }
    public void setLocation(String v)      { location = v; }
    public String getMobileNumber()        { return mobileNumber; }
    public void setMobileNumber(String v)  { mobileNumber = v; }
    public LocalDateTime getSlaDeadline()  { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime v) { slaDeadline = v; }
    public LocalDateTime getCreatedAt()    { return createdAt; }
    public void setCreatedAt(LocalDateTime v)   { createdAt = v; }
    public boolean isSlaBreached()         { return slaBreached; }
    public void setSlaBreached(boolean v)  { slaBreached = v; }
}
