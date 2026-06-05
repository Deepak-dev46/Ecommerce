package com.rvz.assignmentservice.dto.request;

/**
 * FIX: Added supportPersonId for manual assignment.
 * When supportPersonId is set, AssignmentServiceImpl assigns to that specific person.
 * When null, it uses round-robin (highest remaining hours) auto-assign.
 */
public class TriggerAssignmentRequest {

    private Long   ticketId;
    private String priority;
    private Double estimatedHours;
    private Double responseTimeHours;
    private Long   supportPersonId;   // null = auto-assign, non-null = manual assign

    public TriggerAssignmentRequest() {}

    public TriggerAssignmentRequest(Long ticketId, String priority) {
        this.ticketId          = ticketId;
        this.priority          = priority;
        this.estimatedHours    = 1.0;
        this.responseTimeHours = 1.0;
        this.supportPersonId   = null;
    }

    public TriggerAssignmentRequest(Long ticketId, String priority,
                                    Double estimatedHours, Double responseTimeHours) {
        this.ticketId          = ticketId;
        this.priority          = priority;
        this.estimatedHours    = estimatedHours;
        this.responseTimeHours = responseTimeHours;
        this.supportPersonId   = null;
    }

    public Long   getTicketId()                   { return ticketId; }
    public void   setTicketId(Long v)             { this.ticketId = v; }

    public String getPriority()                   { return priority; }
    public void   setPriority(String v)           { this.priority = v; }

    public Double getEstimatedHours()             { return estimatedHours; }
    public void   setEstimatedHours(Double v)     { this.estimatedHours = v; }

    public Double getResponseTimeHours()          { return responseTimeHours; }
    public void   setResponseTimeHours(Double v)  { this.responseTimeHours = v; }

    public Long   getSupportPersonId()            { return supportPersonId; }
    public void   setSupportPersonId(Long v)      { this.supportPersonId = v; }
}
