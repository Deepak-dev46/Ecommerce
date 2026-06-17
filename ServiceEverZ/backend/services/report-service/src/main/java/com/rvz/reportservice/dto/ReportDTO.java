package com.rvz.reportservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Generic report response DTO.
 * Wraps any report payload with metadata for API consistency.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportDTO {

    // ── Metadata ──────────────────────────────────────────────────────────────
    private String reportType;
    private String reportTitle;
    private LocalDateTime generatedAt;
    private long totalRecords;
    private int currentPage;
    private int pageSize;
    private int totalPages;

    // ── Summary / KPI fields ──────────────────────────────────────────────────
    private Long totalTickets;
    private Long openTickets;
    private Long inProgressTickets;
    private Long resolvedTickets;
    private Long closedTickets;
    private Long reopenedTickets;
    private Long cancelledTickets;
    private Long onHoldTickets;

    private Long slaCompliantCount;
    private Long slaBreachedCount;
    private Double slaCompliancePercentage;

    private Double averageCsatScore;
    private Long totalFeedbackCount;
    private Long positiveFeedbackCount;
    private Long negativeFeedbackCount;

    private Long totalIncidents;
    private Long openIncidents;
    private Long resolvedIncidents;

    private Double averageResolutionTimeMinutes;
    private Double averageResponseTimeMinutes;

    // ── Chart / aggregation data ──────────────────────────────────────────────
    private Map<String, Long> statusBreakdown;
    private Map<String, Long> priorityBreakdown;
    private Map<String, Long> categoryBreakdown;
    private Map<String, Long> assigneeBreakdown;
    private List<Map<String, Object>> trendData;

    // ── Row-level detail ──────────────────────────────────────────────────────
    private List<Map<String, Object>> rows;

    // ── Applied filter echo ───────────────────────────────────────────────────
    private ReportFilterDTO appliedFilters;

    public ReportDTO() {}

    // ── Static factory / builder replacement ──────────────────────────────────

    public static Builder create() {
        return new Builder();
    }

    public static class Builder {
        private final ReportDTO dto = new ReportDTO();

        public Builder reportType(String reportType) { dto.reportType = reportType; return this; }
        public Builder reportTitle(String reportTitle) { dto.reportTitle = reportTitle; return this; }
        public Builder generatedAt(LocalDateTime generatedAt) { dto.generatedAt = generatedAt; return this; }
        public Builder totalRecords(long totalRecords) { dto.totalRecords = totalRecords; return this; }
        public Builder currentPage(int currentPage) { dto.currentPage = currentPage; return this; }
        public Builder pageSize(int pageSize) { dto.pageSize = pageSize; return this; }
        public Builder totalPages(int totalPages) { dto.totalPages = totalPages; return this; }
        public Builder totalTickets(Long totalTickets) { dto.totalTickets = totalTickets; return this; }
        public Builder openTickets(Long openTickets) { dto.openTickets = openTickets; return this; }
        public Builder inProgressTickets(Long inProgressTickets) { dto.inProgressTickets = inProgressTickets; return this; }
        public Builder resolvedTickets(Long resolvedTickets) { dto.resolvedTickets = resolvedTickets; return this; }
        public Builder closedTickets(Long closedTickets) { dto.closedTickets = closedTickets; return this; }
        public Builder reopenedTickets(Long reopenedTickets) { dto.reopenedTickets = reopenedTickets; return this; }
        public Builder cancelledTickets(Long cancelledTickets) { dto.cancelledTickets = cancelledTickets; return this; }
        public Builder onHoldTickets(Long onHoldTickets) { dto.onHoldTickets = onHoldTickets; return this; }
        public Builder slaCompliantCount(Long slaCompliantCount) { dto.slaCompliantCount = slaCompliantCount; return this; }
        public Builder slaBreachedCount(Long slaBreachedCount) { dto.slaBreachedCount = slaBreachedCount; return this; }
        public Builder slaCompliancePercentage(Double slaCompliancePercentage) { dto.slaCompliancePercentage = slaCompliancePercentage; return this; }
        public Builder averageCsatScore(Double averageCsatScore) { dto.averageCsatScore = averageCsatScore; return this; }
        public Builder totalFeedbackCount(Long totalFeedbackCount) { dto.totalFeedbackCount = totalFeedbackCount; return this; }
        public Builder positiveFeedbackCount(Long positiveFeedbackCount) { dto.positiveFeedbackCount = positiveFeedbackCount; return this; }
        public Builder negativeFeedbackCount(Long negativeFeedbackCount) { dto.negativeFeedbackCount = negativeFeedbackCount; return this; }
        public Builder totalIncidents(Long totalIncidents) { dto.totalIncidents = totalIncidents; return this; }
        public Builder openIncidents(Long openIncidents) { dto.openIncidents = openIncidents; return this; }
        public Builder resolvedIncidents(Long resolvedIncidents) { dto.resolvedIncidents = resolvedIncidents; return this; }
        public Builder averageResolutionTimeMinutes(Double v) { dto.averageResolutionTimeMinutes = v; return this; }
        public Builder averageResponseTimeMinutes(Double v) { dto.averageResponseTimeMinutes = v; return this; }
        public Builder statusBreakdown(Map<String, Long> statusBreakdown) { dto.statusBreakdown = statusBreakdown; return this; }
        public Builder priorityBreakdown(Map<String, Long> priorityBreakdown) { dto.priorityBreakdown = priorityBreakdown; return this; }
        public Builder categoryBreakdown(Map<String, Long> categoryBreakdown) { dto.categoryBreakdown = categoryBreakdown; return this; }
        public Builder assigneeBreakdown(Map<String, Long> assigneeBreakdown) { dto.assigneeBreakdown = assigneeBreakdown; return this; }
        public Builder trendData(List<Map<String, Object>> trendData) { dto.trendData = trendData; return this; }
        public Builder rows(List<Map<String, Object>> rows) { dto.rows = rows; return this; }
        public Builder appliedFilters(ReportFilterDTO appliedFilters) { dto.appliedFilters = appliedFilters; return this; }

        public ReportDTO build() { return dto; }
    }

    // ── Getters and Setters ───────────────────────────────────────────────────

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getReportTitle() { return reportTitle; }
    public void setReportTitle(String reportTitle) { this.reportTitle = reportTitle; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }

    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public Long getTotalTickets() { return totalTickets; }
    public void setTotalTickets(Long totalTickets) { this.totalTickets = totalTickets; }

    public Long getOpenTickets() { return openTickets; }
    public void setOpenTickets(Long openTickets) { this.openTickets = openTickets; }

    public Long getInProgressTickets() { return inProgressTickets; }
    public void setInProgressTickets(Long inProgressTickets) { this.inProgressTickets = inProgressTickets; }

    public Long getResolvedTickets() { return resolvedTickets; }
    public void setResolvedTickets(Long resolvedTickets) { this.resolvedTickets = resolvedTickets; }

    public Long getClosedTickets() { return closedTickets; }
    public void setClosedTickets(Long closedTickets) { this.closedTickets = closedTickets; }

    public Long getReopenedTickets() { return reopenedTickets; }
    public void setReopenedTickets(Long reopenedTickets) { this.reopenedTickets = reopenedTickets; }

    public Long getCancelledTickets() { return cancelledTickets; }
    public void setCancelledTickets(Long cancelledTickets) { this.cancelledTickets = cancelledTickets; }

    public Long getOnHoldTickets() { return onHoldTickets; }
    public void setOnHoldTickets(Long onHoldTickets) { this.onHoldTickets = onHoldTickets; }

    public Long getSlaCompliantCount() { return slaCompliantCount; }
    public void setSlaCompliantCount(Long slaCompliantCount) { this.slaCompliantCount = slaCompliantCount; }

    public Long getSlaBreachedCount() { return slaBreachedCount; }
    public void setSlaBreachedCount(Long slaBreachedCount) { this.slaBreachedCount = slaBreachedCount; }

    public Double getSlaCompliancePercentage() { return slaCompliancePercentage; }
    public void setSlaCompliancePercentage(Double slaCompliancePercentage) { this.slaCompliancePercentage = slaCompliancePercentage; }

    public Double getAverageCsatScore() { return averageCsatScore; }
    public void setAverageCsatScore(Double averageCsatScore) { this.averageCsatScore = averageCsatScore; }

    public Long getTotalFeedbackCount() { return totalFeedbackCount; }
    public void setTotalFeedbackCount(Long totalFeedbackCount) { this.totalFeedbackCount = totalFeedbackCount; }

    public Long getPositiveFeedbackCount() { return positiveFeedbackCount; }
    public void setPositiveFeedbackCount(Long positiveFeedbackCount) { this.positiveFeedbackCount = positiveFeedbackCount; }

    public Long getNegativeFeedbackCount() { return negativeFeedbackCount; }
    public void setNegativeFeedbackCount(Long negativeFeedbackCount) { this.negativeFeedbackCount = negativeFeedbackCount; }

    public Long getTotalIncidents() { return totalIncidents; }
    public void setTotalIncidents(Long totalIncidents) { this.totalIncidents = totalIncidents; }

    public Long getOpenIncidents() { return openIncidents; }
    public void setOpenIncidents(Long openIncidents) { this.openIncidents = openIncidents; }

    public Long getResolvedIncidents() { return resolvedIncidents; }
    public void setResolvedIncidents(Long resolvedIncidents) { this.resolvedIncidents = resolvedIncidents; }

    public Double getAverageResolutionTimeMinutes() { return averageResolutionTimeMinutes; }
    public void setAverageResolutionTimeMinutes(Double averageResolutionTimeMinutes) { this.averageResolutionTimeMinutes = averageResolutionTimeMinutes; }

    public Double getAverageResponseTimeMinutes() { return averageResponseTimeMinutes; }
    public void setAverageResponseTimeMinutes(Double averageResponseTimeMinutes) { this.averageResponseTimeMinutes = averageResponseTimeMinutes; }

    public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }

    public Map<String, Long> getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }

    public Map<String, Long> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<String, Long> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public Map<String, Long> getAssigneeBreakdown() { return assigneeBreakdown; }
    public void setAssigneeBreakdown(Map<String, Long> assigneeBreakdown) { this.assigneeBreakdown = assigneeBreakdown; }

    public List<Map<String, Object>> getTrendData() { return trendData; }
    public void setTrendData(List<Map<String, Object>> trendData) { this.trendData = trendData; }

    public List<Map<String, Object>> getRows() { return rows; }
    public void setRows(List<Map<String, Object>> rows) { this.rows = rows; }

    public ReportFilterDTO getAppliedFilters() { return appliedFilters; }
    public void setAppliedFilters(ReportFilterDTO appliedFilters) { this.appliedFilters = appliedFilters; }
}
