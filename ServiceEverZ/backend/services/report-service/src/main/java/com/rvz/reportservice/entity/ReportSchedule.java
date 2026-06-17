package com.rvz.reportservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Persists a scheduled report configuration (US-96).
 * One row = one schedule entry with frequency + recipient list + report type.
 */
@Entity
@Table(name = "report_schedule")
public class ReportSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_type", nullable = false, length = 100)
    private String reportType;

    /**
     * DAILY | WEEKLY | MONTHLY
     */
    @Column(name = "frequency", nullable = false, length = 20)
    private String frequency;

    /**
     * Comma-separated list of recipient email addresses.
     */
    @Column(name = "recipients", nullable = false, columnDefinition = "TEXT")
    private String recipients;

    /**
     * JSON snapshot of filter params (optional).
     */
    @Column(name = "filter_json", columnDefinition = "TEXT")
    private String filterJson;

    @Column(name = "active")
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "next_run_at")
    private LocalDateTime nextRunAt;

    public ReportSchedule() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getRecipients() { return recipients; }
    public void setRecipients(String recipients) { this.recipients = recipients; }

    public String getFilterJson() { return filterJson; }
    public void setFilterJson(String filterJson) { this.filterJson = filterJson; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getNextRunAt() { return nextRunAt; }
    public void setNextRunAt(LocalDateTime nextRunAt) { this.nextRunAt = nextRunAt; }
}
