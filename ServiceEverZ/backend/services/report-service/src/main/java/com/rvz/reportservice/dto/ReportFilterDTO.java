package com.rvz.reportservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

/**
 * Incoming filter/pagination parameters for every report endpoint.
 * All fields are optional — the service applies only the non-null ones.
 */
public class ReportFilterDTO {

    // ── Date range ────────────────────────────────────────────────────────────
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    // ── Free-text search ──────────────────────────────────────────────────────
    private String searchKeyword;

    // ── Dimension filters ─────────────────────────────────────────────────────
    private String status;
    private String priority;
    private String categoryName;
    private String subCategoryName;
    private String assigneeName;
    private Long   assigneeId;
    private Long   userId;
    private Long   projectId;
    private String department;
    private String location;

    // ── SLA filter ────────────────────────────────────────────────────────────
    private Boolean slaBreached;

    // ── Approval filter ───────────────────────────────────────────────────────
    private String approvalStatus;

    // ── Incident filter ───────────────────────────────────────────────────────
    private String incidentSource;

    // ── CSAT filter ───────────────────────────────────────────────────────────
    @Min(1) @Max(5)
    private Integer minRating;

    @Min(1) @Max(5)
    private Integer maxRating;

    // ── Pagination ────────────────────────────────────────────────────────────
    @Min(0)
    private int page = 0;

    @Min(1) @Max(500)
    private int size = 20;

    // ── Sorting ───────────────────────────────────────────────────────────────
    private String sortBy = "createdAt";

    @Pattern(regexp = "(?i)asc|desc", message = "sortDirection must be 'asc' or 'desc'")
    private String sortDirection = "desc";

    public ReportFilterDTO() {}

    // ── Static factory / builder replacement ──────────────────────────────────

    public static Builder create() {
        return new Builder();
    }

    public static class Builder {
        private final ReportFilterDTO dto = new ReportFilterDTO();

        public Builder startDate(LocalDate startDate) { dto.startDate = startDate; return this; }
        public Builder endDate(LocalDate endDate) { dto.endDate = endDate; return this; }
        public Builder searchKeyword(String searchKeyword) { dto.searchKeyword = searchKeyword; return this; }
        public Builder status(String status) { dto.status = status; return this; }
        public Builder priority(String priority) { dto.priority = priority; return this; }
        public Builder categoryName(String categoryName) { dto.categoryName = categoryName; return this; }
        public Builder subCategoryName(String subCategoryName) { dto.subCategoryName = subCategoryName; return this; }
        public Builder assigneeName(String assigneeName) { dto.assigneeName = assigneeName; return this; }
        public Builder assigneeId(Long assigneeId) { dto.assigneeId = assigneeId; return this; }
        public Builder userId(Long userId) { dto.userId = userId; return this; }
        public Builder projectId(Long projectId) { dto.projectId = projectId; return this; }
        public Builder department(String department) { dto.department = department; return this; }
        public Builder location(String location) { dto.location = location; return this; }
        public Builder slaBreached(Boolean slaBreached) { dto.slaBreached = slaBreached; return this; }
        public Builder approvalStatus(String approvalStatus) { dto.approvalStatus = approvalStatus; return this; }
        public Builder incidentSource(String incidentSource) { dto.incidentSource = incidentSource; return this; }
        public Builder minRating(Integer minRating) { dto.minRating = minRating; return this; }
        public Builder maxRating(Integer maxRating) { dto.maxRating = maxRating; return this; }
        public Builder page(int page) { dto.page = page; return this; }
        public Builder size(int size) { dto.size = size; return this; }
        public Builder sortBy(String sortBy) { dto.sortBy = sortBy; return this; }
        public Builder sortDirection(String sortDirection) { dto.sortDirection = sortDirection; return this; }

        public ReportFilterDTO build() { return dto; }
    }

    // ── Getters and Setters ───────────────────────────────────────────────────

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getSearchKeyword() { return searchKeyword; }
    public void setSearchKeyword(String searchKeyword) { this.searchKeyword = searchKeyword; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getSubCategoryName() { return subCategoryName; }
    public void setSubCategoryName(String subCategoryName) { this.subCategoryName = subCategoryName; }

    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Boolean getSlaBreached() { return slaBreached; }
    public void setSlaBreached(Boolean slaBreached) { this.slaBreached = slaBreached; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getIncidentSource() { return incidentSource; }
    public void setIncidentSource(String incidentSource) { this.incidentSource = incidentSource; }

    public Integer getMinRating() { return minRating; }
    public void setMinRating(Integer minRating) { this.minRating = minRating; }

    public Integer getMaxRating() { return maxRating; }
    public void setMaxRating(Integer maxRating) { this.maxRating = maxRating; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortDirection() { return sortDirection; }
    public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }
}
