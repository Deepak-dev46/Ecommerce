package com.rvz.approvalservice.dto.response;

import java.time.LocalDateTime;

public class ApprovalResponse {
    private Long approvalId;
    private Long ticketId;

    // FIX 3: ticket display fields for queue pages
    private String ticketNumber;
    private String ticketSubject;
    private String requesterName;

    private String l1ApproverId;
    private String l1ApproverEmail;
    private String l1ApproverName;
    private String l1Status;
    private String l2ApproverId;
    private String l2ApproverEmail;
    private String l2ApproverName;
    private String l2Status;
    private String resourceOwnerId;
    private String resourceOwnerEmail;
    private String resourceOwnerName;
    private String resourceOwnerStatus;
    private Boolean requiresResourceApproval;
    private String overallStatus;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApprovalResponse() {}

    public Long getApprovalId() { return approvalId; }
    public void setApprovalId(Long approvalId) { this.approvalId = approvalId; }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getTicketSubject() { return ticketSubject; }
    public void setTicketSubject(String ticketSubject) { this.ticketSubject = ticketSubject; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public String getL1ApproverId() { return l1ApproverId; }
    public void setL1ApproverId(String l1ApproverId) { this.l1ApproverId = l1ApproverId; }

    public String getL1ApproverEmail() { return l1ApproverEmail; }
    public void setL1ApproverEmail(String l1ApproverEmail) { this.l1ApproverEmail = l1ApproverEmail; }

    public String getL1ApproverName() { return l1ApproverName; }
    public void setL1ApproverName(String l1ApproverName) { this.l1ApproverName = l1ApproverName; }

    public String getL1Status() { return l1Status; }
    public void setL1Status(String l1Status) { this.l1Status = l1Status; }

    public String getL2ApproverId() { return l2ApproverId; }
    public void setL2ApproverId(String l2ApproverId) { this.l2ApproverId = l2ApproverId; }

    public String getL2ApproverEmail() { return l2ApproverEmail; }
    public void setL2ApproverEmail(String l2ApproverEmail) { this.l2ApproverEmail = l2ApproverEmail; }

    public String getL2ApproverName() { return l2ApproverName; }
    public void setL2ApproverName(String l2ApproverName) { this.l2ApproverName = l2ApproverName; }

    public String getL2Status() { return l2Status; }
    public void setL2Status(String l2Status) { this.l2Status = l2Status; }

    public String getResourceOwnerId() { return resourceOwnerId; }
    public void setResourceOwnerId(String resourceOwnerId) { this.resourceOwnerId = resourceOwnerId; }

    public String getResourceOwnerEmail() { return resourceOwnerEmail; }
    public void setResourceOwnerEmail(String resourceOwnerEmail) { this.resourceOwnerEmail = resourceOwnerEmail; }

    public String getResourceOwnerName() { return resourceOwnerName; }
    public void setResourceOwnerName(String resourceOwnerName) { this.resourceOwnerName = resourceOwnerName; }

    public String getResourceOwnerStatus() { return resourceOwnerStatus; }
    public void setResourceOwnerStatus(String resourceOwnerStatus) { this.resourceOwnerStatus = resourceOwnerStatus; }

    public Boolean getRequiresResourceApproval() { return requiresResourceApproval; }
    public void setRequiresResourceApproval(Boolean requiresResourceApproval) { this.requiresResourceApproval = requiresResourceApproval; }

    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
