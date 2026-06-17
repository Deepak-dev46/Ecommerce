package com.rvz.reportservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Stores metadata about each report generation request.
 * Useful for audit trail and history of exported reports.
 */
@Entity
@Table(name = "report_record")
public class ReportRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "report_type", nullable = false)
    private String reportType;

    @Column(name = "report_title")
    private String reportTitle;

    @Column(name = "generated_by")
    private String generatedBy;

    @Column(name = "generated_by_id")
    private Long generatedById;

    @Column(name = "filter_summary", columnDefinition = "TEXT")
    private String filterSummary;

    @Column(name = "record_count")
    private Long recordCount;

    @Column(name = "export_format")
    private String exportFormat;

    @Column(name = "file_path")
    private String filePath;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    public ReportRecord() {}

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getReportTitle() { return reportTitle; }
    public void setReportTitle(String reportTitle) { this.reportTitle = reportTitle; }

    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }

    public Long getGeneratedById() { return generatedById; }
    public void setGeneratedById(Long generatedById) { this.generatedById = generatedById; }

    public String getFilterSummary() { return filterSummary; }
    public void setFilterSummary(String filterSummary) { this.filterSummary = filterSummary; }

    public Long getRecordCount() { return recordCount; }
    public void setRecordCount(Long recordCount) { this.recordCount = recordCount; }

    public String getExportFormat() { return exportFormat; }
    public void setExportFormat(String exportFormat) { this.exportFormat = exportFormat; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
