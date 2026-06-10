package com.rvz.approvalservice.dto.request;

public class AssignmentTriggerRequest {
    private Long ticketId;
    private String priority;


    public AssignmentTriggerRequest(Long ticketId, String priority ,double d,double e) {
        this.ticketId = ticketId;
        this.priority = priority;
    }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
