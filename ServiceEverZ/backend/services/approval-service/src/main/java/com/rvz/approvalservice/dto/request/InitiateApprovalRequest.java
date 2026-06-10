
package com.rvz.approvalservice.dto.request;
 
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
 
/**
 * Request DTO sent by ticket-service to initiate the approval workflow.
 *
 * Change from original:
 *   - Added {@code projectId} field so approval-service can call master-service
 *     and resolve the REAL L1, L2, and Resource Owner email addresses.
 *   - All existing fields and validation annotations are completely unchanged
 *     so no other connected service is affected.
 */
public class InitiateApprovalRequest {
 
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;
 
    /**
     * The project this ticket belongs to.
     * approval-service uses this to call:
     *   GET master-service/api/master/projects/{projectId}
     * and fetch l1ManagerId, l2ManagerId, resourceOwnerId — then their real emails.
     */
    private Long projectId;
 
    /*
     * Fields below are kept as fallback.
     * If master-service is reachable, real data from the project table overrides these.
     * If master-service is down, these values are used so nothing crashes.
     */
 
    @NotBlank(message = "L1 approver ID is required")
    private String l1ApproverId;
 
    @NotBlank(message = "L1 approver name is required")
    private String l1ApproverName;
 
    @NotBlank(message = "L1 approver email is required")
    @Email(message = "L1 approver email is invalid")
    private String l1ApproverEmail;
 
    @NotBlank(message = "L2 approver ID is required")
    private String l2ApproverId;
 
    @NotBlank(message = "L2 approver name is required")
    private String l2ApproverName;
 
    @NotBlank(message = "L2 approver email is required")
    @Email(message = "L2 approver email is invalid")
    private String l2ApproverEmail;
 
    private boolean requiresResourceApproval;
 
    private String resourceOwnerId;
    private String resourceOwnerName;
    private String resourceOwnerEmail;
 
    @NotBlank(message = "Requester name is required")
    private String requesterName;
 
    @NotBlank(message = "Requester email is required")
    @Email(message = "Requester email is invalid")
    private String requesterEmail;
 
    @NotBlank(message = "Ticket subject is required")
    private String ticketSubject;

    // ticket number for queue display (e.g. INC-1234567-456)
    private String ticketNumber;
 
    public InitiateApprovalRequest() {}
 
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
 
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
 
    public String getL1ApproverId() { return l1ApproverId; }
    public void setL1ApproverId(String l1ApproverId) { this.l1ApproverId = l1ApproverId; }
 
    public String getL1ApproverName() { return l1ApproverName; }
    public void setL1ApproverName(String l1ApproverName) { this.l1ApproverName = l1ApproverName; }
 
    public String getL1ApproverEmail() { return l1ApproverEmail; }
    public void setL1ApproverEmail(String l1ApproverEmail) { this.l1ApproverEmail = l1ApproverEmail; }
 
    public String getL2ApproverId() { return l2ApproverId; }
    public void setL2ApproverId(String l2ApproverId) { this.l2ApproverId = l2ApproverId; }
 
    public String getL2ApproverName() { return l2ApproverName; }
    public void setL2ApproverName(String l2ApproverName) { this.l2ApproverName = l2ApproverName; }
 
    public String getL2ApproverEmail() { return l2ApproverEmail; }
    public void setL2ApproverEmail(String l2ApproverEmail) { this.l2ApproverEmail = l2ApproverEmail; }
 
    public boolean isRequiresResourceApproval() { return requiresResourceApproval; }
    public void setRequiresResourceApproval(boolean requiresResourceApproval) {
        this.requiresResourceApproval = requiresResourceApproval;
    }
 
    public String getResourceOwnerId() { return resourceOwnerId; }
    public void setResourceOwnerId(String resourceOwnerId) { this.resourceOwnerId = resourceOwnerId; }
 
    public String getResourceOwnerName() { return resourceOwnerName; }
    public void setResourceOwnerName(String resourceOwnerName) { this.resourceOwnerName = resourceOwnerName; }
 
    public String getResourceOwnerEmail() { return resourceOwnerEmail; }
    public void setResourceOwnerEmail(String resourceOwnerEmail) { this.resourceOwnerEmail = resourceOwnerEmail; }
 
    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
 
    public String getRequesterEmail() { return requesterEmail; }
    public void setRequesterEmail(String requesterEmail) { this.requesterEmail = requesterEmail; }
 
    public String getTicketSubject() { return ticketSubject; }
    public void setTicketSubject(String ticketSubject) { this.ticketSubject = ticketSubject; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
}