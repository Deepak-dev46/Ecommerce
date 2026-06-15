package com.serviceeverz.rmoservice.project.dto;

import com.serviceeverz.rmoservice.project.entity.Project;
import com.serviceeverz.rmoservice.shared.enums.ProjectStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectResponse {

    private Long id;
    private String projectCode;
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
    private String clientOwner;
    private String reportingDetails;
    private Long l1ManagerId;
    private Long l2ManagerId;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
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

	public static ProjectResponse from(Project p) {
        ProjectResponse r = new ProjectResponse();
        r.id = p.getId();
        r.projectCode = p.getProjectCode();
        r.client = p.getClient();
        r.projectName = p.getProjectName();
        r.description = p.getDescription();
        r.practice = p.getPractice();
        r.businessUnit = p.getBusinessUnit();
        r.region = p.getRegion();
        r.department = p.getDepartment();
        r.engagementModel = p.getEngagementModel();
        r.displayName = p.getDisplayName();
        r.projectShortName = p.getProjectShortName();
        r.type = p.getType();
        r.category = p.getCategory();
        r.clientCostCenter = p.getClientCostCenter();
        r.costGroup = p.getCostGroup();
        r.division = p.getDivision();
        r.status = p.getStatus();
        r.resourceOwnerId = p.getResourceOwnerId();
        r.clientOwner = p.getClientOwner();
        r.reportingDetails = p.getReportingDetails();
        r.l1ManagerId = p.getL1ManagerId();
        r.l2ManagerId = p.getL2ManagerId();
        r.createdBy = p.getCreatedBy();
        r.createdAt = p.getCreatedAt();
        r.updatedAt = p.getUpdatedAt();
        r.projectStartDate=p.getProjectStartDate();
        r.projectEndDate =p.getProjectEndDate();
        return r;
    }

    public Long getId() { return id; }
    public String getProjectCode() { return projectCode; }
    public String getClient() { return client; }
    public String getProjectName() { return projectName; }
    public String getDescription() { return description; }
    public String getPractice() { return practice; }
    public String getBusinessUnit() { return businessUnit; }
    public String getRegion() { return region; }
    public String getDepartment() { return department; }
    public String getEngagementModel() { return engagementModel; }
    public String getDisplayName() { return displayName; }
    public String getProjectShortName() { return projectShortName; }
    public String getType() { return type; }
    public String getCategory() { return category; }
    public String getClientCostCenter() { return clientCostCenter; }
    public String getCostGroup() { return costGroup; }
    public String getDivision() { return division; }
    public ProjectStatus getStatus() { return status; }
    public Long getResourceOwnerid() { return resourceOwnerId; }
    public String getClientOwner() { return clientOwner; }
    public String getReportingDetails() { return reportingDetails; }
    public Long getL1ManagerId() { return l1ManagerId; }
    public Long getL2ManagerId() { return l2ManagerId; }
    public Long getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}