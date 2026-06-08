package com.relevantz.ticketservice.dto;

public class InitiateApprovalRequest {
    private Long    ticketId;
    private Integer categoryId;
    private Integer subCategoryId;
    private Long    projectId;
    private Boolean requiresResourceApproval;
    private String  requesterName;
    private String  requesterEmail;
    private String  ticketSubject;
    private String  ticketNumber;   // NEW: stored in approval-service for queue display
    private String  l1ApproverId;
    private String  l1ApproverName;
    private String  l1ApproverEmail;
    private String  l2ApproverId;
    private String  l2ApproverName;
    private String  l2ApproverEmail;
    private String  resourceOwnerId;
    private String  resourceOwnerName;
    private String  resourceOwnerEmail;

    public Long    getTicketId()                     { return ticketId; }
    public void    setTicketId(Long v)               { this.ticketId = v; }
    public Integer getCategoryId()                   { return categoryId; }
    public void    setCategoryId(Integer v)          { this.categoryId = v; }
    public Integer getSubCategoryId()                { return subCategoryId; }
    public void    setSubCategoryId(Integer v)       { this.subCategoryId = v; }
    public Long    getProjectId()                    { return projectId; }
    public void    setProjectId(Long v)              { this.projectId = v; }
    public Boolean getRequiresResourceApproval()     { return requiresResourceApproval; }
    public void    setRequiresResourceApproval(Boolean v) { this.requiresResourceApproval = v; }
    public String  getRequesterName()                { return requesterName; }
    public void    setRequesterName(String v)        { this.requesterName = v; }
    public String  getRequesterEmail()               { return requesterEmail; }
    public void    setRequesterEmail(String v)       { this.requesterEmail = v; }
    public String  getTicketSubject()                { return ticketSubject; }
    public void    setTicketSubject(String v)        { this.ticketSubject = v; }
    public String  getTicketNumber()                 { return ticketNumber; }
    public void    setTicketNumber(String v)         { this.ticketNumber = v; }
    public String  getL1ApproverId()                 { return l1ApproverId; }
    public void    setL1ApproverId(String v)         { this.l1ApproverId = v; }
    public String  getL1ApproverName()               { return l1ApproverName; }
    public void    setL1ApproverName(String v)       { this.l1ApproverName = v; }
    public String  getL1ApproverEmail()              { return l1ApproverEmail; }
    public void    setL1ApproverEmail(String v)      { this.l1ApproverEmail = v; }
    public String  getL2ApproverId()                 { return l2ApproverId; }
    public void    setL2ApproverId(String v)         { this.l2ApproverId = v; }
    public String  getL2ApproverName()               { return l2ApproverName; }
    public void    setL2ApproverName(String v)       { this.l2ApproverName = v; }
    public String  getL2ApproverEmail()              { return l2ApproverEmail; }
    public void    setL2ApproverEmail(String v)      { this.l2ApproverEmail = v; }
    public String  getResourceOwnerId()              { return resourceOwnerId; }
    public void    setResourceOwnerId(String v)      { this.resourceOwnerId = v; }
    public String  getResourceOwnerName()            { return resourceOwnerName; }
    public void    setResourceOwnerName(String v)    { this.resourceOwnerName = v; }
    public String  getResourceOwnerEmail()           { return resourceOwnerEmail; }
    public void    setResourceOwnerEmail(String v)   { this.resourceOwnerEmail = v; }
}
