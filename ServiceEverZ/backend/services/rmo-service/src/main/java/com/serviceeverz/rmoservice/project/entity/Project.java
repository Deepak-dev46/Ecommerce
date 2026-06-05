package com.serviceeverz.rmoservice.project.entity;

import com.serviceeverz.rmoservice.shared.enums.ProjectStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
@Table(name = "projects", uniqueConstraints = {
        @UniqueConstraint(columnNames = "project_code"),
        @UniqueConstraint(columnNames = "project_name")
})
public class Project {

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
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_code", nullable = false, unique = true, updatable = false)
    private String projectCode;

    @Column(name = "client")
    private String client;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String practice;

    @Column(name = "business_unit")
    private String businessUnit;

    private String region;

    public Long getResourceOwnerId() {
		return resourceOwnerId;
	}

	public void setResourceOwnerId(Long resourceOwnerId) {
		this.resourceOwnerId = resourceOwnerId;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
	private String department;

    @Column(name = "engagement_model")
    private String engagementModel;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "project_short_name")
    private String projectShortName;

    private String type;

    private String category;

    @Column(name = "client_cost_center")
    private String clientCostCenter;

    @Column(name = "cost_group")
    private String costGroup;

    private String division;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.ACTIVE;

    @Column(name = "resource_owner_id")
    private Long resourceOwnerId;

    @Column(name = "client_owner")
    private String clientOwner;

    @Column(name = "reporting_details", columnDefinition = "TEXT")
    private String reportingDetails;

    @Column(name = "l1_manager_id")
    private Long l1ManagerId;

    @Column(name = "l2_manager_id")
    private Long l2ManagerId;

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @Column(name = "project_start_date")
    private LocalDate projectStartDate;
     
    @Column(name = "project_end_date")
    private LocalDate projectEndDate;
    
    
    

    public Project() {}

    public Long getId() { return id; }
    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String v) { this.projectCode = v; }
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
  
    public String getClientOwner() { return clientOwner; }
    public void setClientOwner(String v) { this.clientOwner = v; }
    public String getReportingDetails() { return reportingDetails; }
    public void setReportingDetails(String v) { this.reportingDetails = v; }
    public Long getL1ManagerId() { return l1ManagerId; }
    public void setL1ManagerId(Long v) { this.l1ManagerId = v; }
    public Long getL2ManagerId() { return l2ManagerId; }
    public void setL2ManagerId(Long v) { this.l2ManagerId = v; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long v) { this.createdBy = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}