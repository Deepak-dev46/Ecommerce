package com.serviceeverz.rmoservice.project.dto;
 
import java.time.LocalDate;

import com.serviceeverz.rmoservice.shared.enums.ProjectStatus;
 
public class UpdateProjectRequest {
 
    private String client;
    private String projectName;
    private String description;
    private String practice;
    private String businessUnit;
    private String region;
    private String department;
    private String engagementModel;
    private String displayName;
    private String projectShortName;
    private String type;
    private String category;
    private String clientCostCenter;
    private String costGroup;
    private String division;
    private ProjectStatus status;
    private Long resourceOwnerId;
    private Long l1ManagerId;
    private Long l2ManagerId;
    private String clientOwner;
    private String reportingDetails;
    
    private LocalDate projectStartDate;
    
    private LocalDate projectEndDate;
    
    
    
    
 
    public LocalDate getProjectStartDate() {
		return projectStartDate;
	}
	public void setProjectStartDate(LocalDate projectStartDate) {
		this.projectStartDate = projectStartDate;
	}
	public LocalDate getProjectEndDate() {
		return projectEndDate;
	}
	public void setProjectEndDate(LocalDate projectEndDate) {
		this.projectEndDate = projectEndDate;
	}
	public String getClient() { return client; }
    public void setClient(String v) { this.client = v; }
 
    public String getProjectName() { return projectName; }
    public void setProjectName(String v) { this.projectName = v; }
 
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
 
    public String getPractice() { return practice; }
    public void setPractice(String v) { this.practice = v; }
 
    public String getBusinessUnit() { return businessUnit; }
    public void setBusinessUnit(String v) { this.businessUnit = v; }
 
    public String getRegion() { return region; }
    public void setRegion(String v) { this.region = v; }
 
    public String getDepartment() { return department; }
    public void setDepartment(String v) { this.department = v; }
 
    public String getEngagementModel() { return engagementModel; }
    public void setEngagementModel(String v) { this.engagementModel = v; }
 
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String v) { this.displayName = v; }
 
    public String getProjectShortName() { return projectShortName; }
    public void setProjectShortName(String v) { this.projectShortName = v; }
 
    public String getType() { return type; }
    public void setType(String v) { this.type = v; }
 
    public String getCategory() { return category; }
    public void setCategory(String v) { this.category = v; }
 
    public String getClientCostCenter() { return clientCostCenter; }
    public void setClientCostCenter(String v) { this.clientCostCenter = v; }
 
    public String getCostGroup() { return costGroup; }
    public void setCostGroup(String v) { this.costGroup = v; }
 
    public String getDivision() { return division; }
    public void setDivision(String v) { this.division = v; }
 
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus v) { this.status = v; }
 
    public Long getResourceOwnerId() { return resourceOwnerId; }
    public void setResourceOwnerId(Long v) { this.resourceOwnerId = v; }
 
    public Long getL1ManagerId() { return l1ManagerId; }
    public void setL1ManagerId(Long v) { this.l1ManagerId = v; }
 
    public Long getL2ManagerId() { return l2ManagerId; }
    public void setL2ManagerId(Long v) { this.l2ManagerId = v; }
 
    public String getClientOwner() { return clientOwner; }
    public void setClientOwner(String v) { this.clientOwner = v; }
 
    public String getReportingDetails() { return reportingDetails; }
    public void setReportingDetails(String v) { this.reportingDetails = v; }
}