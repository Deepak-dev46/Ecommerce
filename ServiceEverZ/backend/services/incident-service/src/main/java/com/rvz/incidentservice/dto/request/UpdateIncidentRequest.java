package com.rvz.incidentservice.dto.request;

/**
 * Payload for updating an existing Incident (status, assignment, notes).
 * All fields are optional — only non-null values are applied.
 */
public class UpdateIncidentRequest {

    private String status;          // In Progress, Resolved, Closed
    private String priority;
    private Long   assignedTo;
    private String assignedToName;
    private String breachByUser;
    private String incidentLocation;
    private String officeLocation;
    private String attachmentPath;

    private String resolutionNotes;
    public String getResolutionNotes()         { return resolutionNotes; }
    public void   setResolutionNotes(String v) { this.resolutionNotes = v; }
    public UpdateIncidentRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public String getBreachByUser() { return breachByUser; }
    public void setBreachByUser(String breachByUser) { this.breachByUser = breachByUser; }

    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }

    public String getOfficeLocation() { return officeLocation; }
    public void setOfficeLocation(String officeLocation) { this.officeLocation = officeLocation; }

    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
}
