package com.rvz.approvalservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ApprovalActionRequest {
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotBlank(message = "Approver level is required")
    private String approverLevel;

    @NotBlank(message = "Action is required")
    private String action;

    private String remarks;

    public ApprovalActionRequest() {}
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getApproverLevel() { return approverLevel; }
    public void setApproverLevel(String approverLevel) { this.approverLevel = approverLevel; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
