package com.rvz.reportservice.service;

import com.rvz.reportservice.dto.ReportDTO;
import com.rvz.reportservice.dto.ReportFilterDTO;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public interface ReportService {

    // ── Core Ticket Reports ───────────────────────────────────────────────────
    ReportDTO getTicketVolumeReport(ReportFilterDTO filter);
    ReportDTO getTicketStatusReport(ReportFilterDTO filter);
    ReportDTO getAssignmentReport(ReportFilterDTO filter);
    ReportDTO getReopenedTicketsReport(ReportFilterDTO filter);
    ReportDTO getTicketResolutionReport(ReportFilterDTO filter);
    ReportDTO getDraftTicketsReport(ReportFilterDTO filter);
    ReportDTO getAdvancedTicketingReport(ReportFilterDTO filter);
    ReportDTO getAutoClosureReport(ReportFilterDTO filter);

    // ── SLA Reports ───────────────────────────────────────────────────────────
    ReportDTO getSlaComplianceReport(ReportFilterDTO filter);
    ReportDTO getSlaBreachReport(ReportFilterDTO filter);
    ReportDTO getSlaOnHoldReport(ReportFilterDTO filter);
    ReportDTO getSlaPolicyEffectivenessReport(ReportFilterDTO filter);

    // ── User / Admin Reports ──────────────────────────────────────────────────
    ReportDTO getUserActivityReport(ReportFilterDTO filter);
    ReportDTO getRoleDistributionReport(ReportFilterDTO filter);
    ReportDTO getBulkUploadAuditReport(ReportFilterDTO filter);
    ReportDTO getLocationAssignmentReport(ReportFilterDTO filter);
    ReportDTO getLoginSecurityReport(ReportFilterDTO filter);

    // ── Approval Reports ──────────────────────────────────────────────────────
    ReportDTO getApprovalQueueReport(ReportFilterDTO filter);
    ReportDTO getApproverPerformanceReport(ReportFilterDTO filter);
    ReportDTO getChangeApprovalReport(ReportFilterDTO filter);

    // ── CSAT Reports ──────────────────────────────────────────────────────────
    ReportDTO getCsatScoreReport(ReportFilterDTO filter);
    ReportDTO getAgentCsatReport(ReportFilterDTO filter);
    ReportDTO getCategoryCsatReport(ReportFilterDTO filter);

    // ── Project / Resource Reports ────────────────────────────────────────────
    ReportDTO getProjectOverviewReport(ReportFilterDTO filter);
    ReportDTO getResourceAllocationReport(ReportFilterDTO filter);
    ReportDTO getResourceChangeHistoryReport(ReportFilterDTO filter);

    // ── Service Catalog Reports ───────────────────────────────────────────────
    ReportDTO getMostRequestedServicesReport(ReportFilterDTO filter);
    ReportDTO getServiceApprovalRateReport(ReportFilterDTO filter);

    // ── Incident / Problem Reports ────────────────────────────────────────────
    ReportDTO getIncidentVolumeReport(ReportFilterDTO filter);
    ReportDTO getProblemIncidentLinkageReport(ReportFilterDTO filter);
    ReportDTO getRootCauseAnalysisReport(ReportFilterDTO filter);

    // ── Knowledge Base Reports ────────────────────────────────────────────────
    ReportDTO getKbArticleUsageReport(ReportFilterDTO filter);
    ReportDTO getArticleQualityReport(ReportFilterDTO filter);
    ReportDTO getKbAuthorReport(ReportFilterDTO filter);

    // ── Audit Trail ───────────────────────────────────────────────────────────
    ReportDTO getAuditTrailReport(ReportFilterDTO filter);

    // ── CSV Export ────────────────────────────────────────────────────────────
    void exportReportAsCsv(String reportType, ReportFilterDTO filter,
                           HttpServletResponse response) throws IOException;
}
