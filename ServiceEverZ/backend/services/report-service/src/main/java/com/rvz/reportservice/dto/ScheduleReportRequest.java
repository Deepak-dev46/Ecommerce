package com.rvz.reportservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Request DTO for scheduling a report (US-96).
 * Captures frequency, recipient list and optional filter snapshot.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScheduleReportRequest {

    @NotBlank(message = "reportType is required")
    private String reportType;

    /**
     * Frequency: DAILY | WEEKLY | MONTHLY
     */
    @NotBlank(message = "frequency is required")
    private String frequency;

    /**
     * At least one recipient email is required (US-96 negative: "At least one recipient is required").
     */
    @NotEmpty(message = "At least one recipient is required")
    private List<@Email(message = "Invalid email format") String> recipients;

    /** Optional — saved filter parameters to apply when generating the scheduled report. */
    private ReportFilterDTO filter;

    public ScheduleReportRequest() {}

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public List<String> getRecipients() { return recipients; }
    public void setRecipients(List<String> recipients) { this.recipients = recipients; }

    public ReportFilterDTO getFilter() { return filter; }
    public void setFilter(ReportFilterDTO filter) { this.filter = filter; }
}
