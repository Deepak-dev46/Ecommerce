package com.rvz.reportservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ReportNotFoundException extends RuntimeException {

    private final String reportType;

    public ReportNotFoundException(String message) {
        super(message);
        this.reportType = null;
    }

    public ReportNotFoundException(String reportType, Long reportId) {
        super("Report not found: type=" + reportType + ", id=" + reportId);
        this.reportType = reportType;
    }

    public String getReportType() {
        return reportType;
    }
}
