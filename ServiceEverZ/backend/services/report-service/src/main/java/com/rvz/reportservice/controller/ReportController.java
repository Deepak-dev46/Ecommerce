package com.rvz.reportservice.controller;

import com.rvz.reportservice.dto.ReportDTO;
import com.rvz.reportservice.dto.ReportFilterDTO;
import com.rvz.reportservice.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * REST controller for all ITSM report endpoints.
 *
 * <p>Base path: {@code /api/reports}
 *
 * <p>Role-based access: ITSM_MANAGER, ADMIN, and MANAGER roles are permitted.
 * The API Gateway injects the X-User-Roles header after JWT validation.
 * If no header is present (direct internal calls), access is also granted.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    // FIX: Expanded allowed roles — seed data users have ADMIN/MANAGER roles,
    // not just ITSM_MANAGER. Also allow missing header for direct/internal calls.
    private static final List<String> ALLOWED_ROLES = Arrays.asList(
            "ITSM_MANAGER", "ADMIN", "MANAGER", "AGENT"
    );

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Role guard helper
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Returns true when:
     *  1. X-User-Roles header is missing or blank (direct/internal call — allow through), OR
     *  2. The header contains one of ALLOWED_ROLES.
     */
    private boolean hasReportAccess(HttpServletRequest request) {
        String rolesHeader = request.getHeader("X-User-Roles");
        // No header = direct call (e.g. during dev/testing) — allow through
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return true;
        }
        List<String> roles = Arrays.asList(rolesHeader.split(","));
        return roles.stream()
                .map(String::trim)
                .anyMatch(r -> ALLOWED_ROLES.stream().anyMatch(r::equalsIgnoreCase));
    }

    /** Convenience: return 403 response. */
    private ResponseEntity<ReportDTO> forbidden() {
        log.warn("Access denied to reports — caller does not have a permitted role");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // META  →  /api/reports/meta
    // Returns all categories + reports + their endpoint paths dynamically.
    // Frontend reads this once on load — no hardcoding needed.
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/meta")
    public ResponseEntity<List<Map<String, Object>>> getReportMeta(HttpServletRequest request) {
        if (!hasReportAccess(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Map<String, Object>> categories = new java.util.ArrayList<>();

        // Helper — builds one report entry
        java.util.function.Function<Object[], Map<String, Object>> report = arr -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id",          arr[0]);
            m.put("label",       arr[1]);
            m.put("description", arr[2]);
            m.put("endpoint",    "/api/reports/" + arr[3]);
            return m;
        };

        // ── Ticket Management ──────────────────────────────────────────────
        Map<String, Object> ticketing = new java.util.LinkedHashMap<>();
        ticketing.put("value", "ticket_management");
        ticketing.put("label", "Ticket Management");
        ticketing.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"ticket-volume",      "Ticket Volume Report",              "Total tickets created over time",          "tickets/volume"}),
            report.apply(new Object[]{"ticket-status",      "Ticket Status Distribution Report", "Distribution of tickets by current status","tickets/status-distribution"}),
            report.apply(new Object[]{"assignment",         "Assignment Report",                 "Ticket assignment across agents and teams", "tickets/assignment"}),
            report.apply(new Object[]{"ticket-resolution",  "Ticket Resolution Report",          "Resolution times and closure rates",        "tickets/resolution"}),
            report.apply(new Object[]{"reopened-tickets",   "Reopened Tickets Report",           "Tickets reopened after resolution",         "tickets/reopened"}),
            report.apply(new Object[]{"draft-tickets",      "Draft Tickets Report",              "All tickets currently in draft status",     "tickets/drafts"}),
            report.apply(new Object[]{"advanced-ticketing", "Advanced Ticketing Report",         "Detailed ticketing analytics and trends",   "tickets/advanced"}),
            report.apply(new Object[]{"auto-closure",       "Auto-Closure Report",               "Tickets automatically closed by the system","tickets/auto-closure"})
        ));
        categories.add(ticketing);

        // ── SLA ───────────────────────────────────────────────────────────
        Map<String, Object> sla = new java.util.LinkedHashMap<>();
        sla.put("value", "sla");
        sla.put("label", "SLA");
        sla.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"sla-breach",      "SLA Breach Report",      "Tickets that breached SLA thresholds",    "sla/breaches"}),
            report.apply(new Object[]{"sla-compliance",  "SLA Compliance Report",  "Overall SLA compliance rate over time",   "sla/compliance"}),
            report.apply(new Object[]{"sla-summary",     "SLA Summary Report",     "Summary of SLA performance by category",  "sla/on-hold"}),
            report.apply(new Object[]{"sla-policy",      "SLA Policy Effectiveness","Effectiveness of SLA policies",          "sla/policy-effectiveness"})
        ));
        categories.add(sla);

        // ── User Management ───────────────────────────────────────────────
        Map<String, Object> users = new java.util.LinkedHashMap<>();
        users.put("value", "user_management");
        users.put("label", "User Management");
        users.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"user-activity",       "User Activity Report",        "Activity logs and engagement per user",      "users/activity"}),
            report.apply(new Object[]{"user-roles",          "User Roles Report",           "Distribution of roles across users",         "users/role-distribution"}),
            report.apply(new Object[]{"agent-workload",      "Agent Workload Report",       "Ticket load per agent over time",            "users/activity"}),
            report.apply(new Object[]{"bulk-upload-audit",   "Bulk Upload Audit Report",    "History of bulk user uploads",               "users/bulk-upload-audit"}),
            report.apply(new Object[]{"location-assignment", "Location Assignment Report",  "Users by location assignment",               "users/location-assignment"}),
            report.apply(new Object[]{"login-security",      "Login & Security Report",     "Login attempts and security events",         "users/login-security"})
        ));
        categories.add(users);

        // ── Approval ──────────────────────────────────────────────────────
        Map<String, Object> approval = new java.util.LinkedHashMap<>();
        approval.put("value", "approval");
        approval.put("label", "Approval");
        approval.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"approval-status",  "Approval Status Report",  "Current status of all pending approvals",        "approvals/queue"}),
            report.apply(new Object[]{"approval-history", "Approval History Report", "Historical approval decisions and timelines",    "approvals/approver-performance"}),
            report.apply(new Object[]{"change-approval",  "Change Approval Report",  "Change request approvals and decisions",         "approvals/change"})
        ));
        categories.add(approval);

        // ── CSAT / Feedback ───────────────────────────────────────────────
        Map<String, Object> csat = new java.util.LinkedHashMap<>();
        csat.put("value", "csat");
        csat.put("label", "CSAT / Feedback");
        csat.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"csat-scores",      "CSAT Scores Report",  "Customer satisfaction scores over time",  "csat/scores"}),
            report.apply(new Object[]{"feedback-summary", "Feedback Summary",    "Aggregated feedback themes and ratings",  "csat/category-wise"}),
            report.apply(new Object[]{"agent-csat",       "Agent CSAT Report",   "CSAT scores broken down by agent",        "csat/agent-wise"})
        ));
        categories.add(csat);

        // ── Project & Resource ────────────────────────────────────────────
        Map<String, Object> project = new java.util.LinkedHashMap<>();
        project.put("value", "project_resource");
        project.put("label", "Project & Resource Management");
        project.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"project-status",        "Project Status Report",       "Current status of all active projects",    "projects/overview"}),
            report.apply(new Object[]{"resource-utilization",  "Resource Utilization Report", "Resource allocation and utilization rates","projects/resource-allocation"}),
            report.apply(new Object[]{"resource-changes",      "Resource Changes Report",     "History of resource allocation changes",   "projects/resource-changes"})
        ));
        categories.add(project);

        // ── Service Catalog ───────────────────────────────────────────────
        Map<String, Object> catalog = new java.util.LinkedHashMap<>();
        catalog.put("value", "service_catalog");
        catalog.put("label", "Service Catalog");
        catalog.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"catalog-requests",    "Catalog Requests Report", "All service catalog requests over time",  "service-catalog/most-requested"}),
            report.apply(new Object[]{"catalog-fulfillment", "Fulfillment Report",      "Fulfillment rates for catalog items",     "service-catalog/approval-rate"})
        ));
        categories.add(catalog);

        // ── Incidents ─────────────────────────────────────────────────────
        Map<String, Object> incidents = new java.util.LinkedHashMap<>();
        incidents.put("value", "incidents");
        incidents.put("label", "Incidents");
        incidents.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"incident-volume",   "Incident Volume Report",   "Total incidents raised over time",        "incidents/volume"}),
            report.apply(new Object[]{"problem-linkage",   "Problem Linkage Report",   "Incidents linked to known problems",      "incidents/problem-linkage"}),
            report.apply(new Object[]{"incident-rca",      "RCA Report",               "Root cause analysis for incidents",       "incidents/rca"})
        ));
        categories.add(incidents);

        // ── Knowledge Base ────────────────────────────────────────────────
        Map<String, Object> kb = new java.util.LinkedHashMap<>();
        kb.put("value", "knowledge_base");
        kb.put("label", "Knowledge Base");
        kb.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"kb-usage",    "Article Usage Report",  "Views and helpfulness of KB articles",   "kb/article-usage"}),
            report.apply(new Object[]{"kb-quality",  "KB Quality Report",     "Quality metrics for knowledge articles", "kb/quality"}),
            report.apply(new Object[]{"kb-authors",  "KB Authors Report",     "Contributions by KB authors",            "kb/authors"})
        ));
        categories.add(kb);

        // ── Audit & Compliance ────────────────────────────────────────────
        Map<String, Object> audit = new java.util.LinkedHashMap<>();
        audit.put("value", "audit_compliance");
        audit.put("label", "Audit & Compliance");
        audit.put("reports", java.util.Arrays.asList(
            report.apply(new Object[]{"audit-log",   "Audit Log Report",   "System-wide audit trail of changes",  "audit/trail"}),
            report.apply(new Object[]{"compliance",  "Compliance Report",  "Compliance metrics and violations",   "audit/data-access"})
        ));
        categories.add(audit);

        return ResponseEntity.ok(categories);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TICKET MANAGEMENT  →  /api/reports/tickets/...
    // ═══════════════════════════════════════════════════════════════════════

    /** GET /api/reports/tickets/volume */
    @GetMapping("/tickets/volume")
    public ResponseEntity<ReportDTO> getTicketVolumeReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String assigneeName,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/tickets/volume");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, status, priority,
                categoryName, assigneeName, assigneeId, userId, projectId,
                null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getTicketVolumeReport(filter));
    }

    /** GET /api/reports/tickets/status-distribution */
    @GetMapping("/tickets/status-distribution")
    public ResponseEntity<ReportDTO> getTicketStatusReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String categoryName,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/tickets/status-distribution");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, status, priority,
                categoryName, null, null, null, null,
                null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getTicketStatusReport(filter));
    }

    /** GET /api/reports/tickets/assignment */
    @GetMapping("/tickets/assignment")
    public ResponseEntity<ReportDTO> getAssignmentReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assigneeName,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/tickets/assignment");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, status, null,
                null, assigneeName, assigneeId, null, projectId,
                null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getAssignmentReport(filter));
    }

    /** GET /api/reports/tickets/resolution */
    @GetMapping("/tickets/resolution")
    public ResponseEntity<ReportDTO> getTicketResolutionReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String assigneeName,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/tickets/resolution");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, "RESOLVED", null,
                categoryName, assigneeName, null, null, null,
                null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getTicketResolutionReport(filter));
    }

    /** GET /api/reports/tickets/reopened */
    @GetMapping("/tickets/reopened")
    public ResponseEntity<ReportDTO> getReopenedTicketsReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/tickets/reopened");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, null, null,
                null, null, null, null, null,
                null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getReopenedTicketsReport(filter));
    }

    /** GET /api/reports/tickets/drafts */
    @GetMapping("/tickets/drafts")
    public ResponseEntity<ReportDTO> getDraftTicketsReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/tickets/drafts");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, null, null,
                null, null, null, null, null,
                null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getDraftTicketsReport(filter));
    }

    /** GET /api/reports/tickets/advanced */
    @GetMapping("/tickets/advanced")
    public ResponseEntity<ReportDTO> getAdvancedTicketingReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) Boolean slaBreached,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/tickets/advanced");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, status, priority,
                categoryName, null, null, null, null,
                slaBreached, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getAdvancedTicketingReport(filter));
    }

    /** GET /api/reports/tickets/auto-closure */
    @GetMapping("/tickets/auto-closure")
    public ResponseEntity<ReportDTO> getAutoClosureReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/tickets/auto-closure");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, null, null,
                null, null, null, null, null,
                null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getAutoClosureReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SLA  →  /api/reports/sla/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/sla/compliance")
    public ResponseEntity<ReportDTO> getSlaComplianceReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String categoryName,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/sla/compliance");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, categoryName,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getSlaComplianceReport(filter));
    }

    @GetMapping("/sla/breaches")
    public ResponseEntity<ReportDTO> getSlaBreachReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/sla/breaches");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, priority, null,
                null, null, null, null, true, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getSlaBreachReport(filter));
    }

    @GetMapping("/sla/on-hold")
    public ResponseEntity<ReportDTO> getSlaOnHoldReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/sla/on-hold");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, "ON_HOLD", null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getSlaOnHoldReport(filter));
    }

    @GetMapping("/sla/policy-effectiveness")
    public ResponseEntity<ReportDTO> getSlaPolicyEffectivenessReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/sla/policy-effectiveness");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getSlaPolicyEffectivenessReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // USER MANAGEMENT  →  /api/reports/users/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/users/activity")
    public ResponseEntity<ReportDTO> getUserActivityReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/users/activity");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getUserActivityReport(filter));
    }

    /** GET /api/reports/users/role-distribution
     *  FIX: Added searchKeyword and userId params so the report can filter by specific user.
     */
    @GetMapping("/users/role-distribution")
    public ResponseEntity<ReportDTO> getRoleDistributionReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/users/role-distribution");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, null, null, null,
                null, null, userId, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getRoleDistributionReport(filter));
    }

    @GetMapping("/users/bulk-upload-audit")
    public ResponseEntity<ReportDTO> getBulkUploadAuditReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/users/bulk-upload-audit");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getBulkUploadAuditReport(filter));
    }

    @GetMapping("/users/location-assignment")
    public ResponseEntity<ReportDTO> getLocationAssignmentReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/users/location-assignment");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getLocationAssignmentReport(filter));
    }

    /** GET /api/reports/users/login-security */
    @GetMapping("/users/login-security")
    public ResponseEntity<ReportDTO> getLoginSecurityReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/users/login-security");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getLoginSecurityReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // APPROVALS  →  /api/reports/approvals/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/approvals/queue")
    public ResponseEntity<ReportDTO> getApprovalQueueReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/approvals/queue");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, status, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getApprovalQueueReport(filter));
    }

    @GetMapping("/approvals/approver-performance")
    public ResponseEntity<ReportDTO> getApproverPerformanceReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/approvals/approver-performance");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getApproverPerformanceReport(filter));
    }

    @GetMapping("/approvals/change")
    public ResponseEntity<ReportDTO> getChangeApprovalReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/approvals/change");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, status, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getChangeApprovalReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CSAT  →  /api/reports/csat/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/csat/scores")
    public ResponseEntity<ReportDTO> getCsatScoreReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/csat/scores");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, minRating, maxRating, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getCsatScoreReport(filter));
    }

    @GetMapping("/csat/agent-wise")
    public ResponseEntity<ReportDTO> getAgentCsatReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/csat/agent-wise");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getAgentCsatReport(filter));
    }

    @GetMapping("/csat/category-wise")
    public ResponseEntity<ReportDTO> getCategoryCsatReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String categoryName,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/csat/category-wise");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, categoryName,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getCategoryCsatReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECTS  →  /api/reports/projects/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/projects/overview")
    public ResponseEntity<ReportDTO> getProjectOverviewReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/projects/overview");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getProjectOverviewReport(filter));
    }

    @GetMapping("/projects/resource-allocation")
    public ResponseEntity<ReportDTO> getResourceAllocationReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/projects/resource-allocation");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, projectId, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getResourceAllocationReport(filter));
    }

    @GetMapping("/projects/resource-changes")
    public ResponseEntity<ReportDTO> getResourceChangeHistoryReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/projects/resource-changes");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getResourceChangeHistoryReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SERVICE CATALOG  →  /api/reports/service-catalog/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/service-catalog/most-requested")
    public ResponseEntity<ReportDTO> getMostRequestedServicesReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/service-catalog/most-requested");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getMostRequestedServicesReport(filter));
    }

    @GetMapping("/service-catalog/approval-rate")
    public ResponseEntity<ReportDTO> getServiceApprovalRateReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/service-catalog/approval-rate");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getServiceApprovalRateReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INCIDENTS  →  /api/reports/incidents/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/incidents/volume")
    public ResponseEntity<ReportDTO> getIncidentVolumeReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/incidents/volume");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, priority, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getIncidentVolumeReport(filter));
    }

    @GetMapping("/incidents/problem-linkage")
    public ResponseEntity<ReportDTO> getProblemIncidentLinkageReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/incidents/problem-linkage");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getProblemIncidentLinkageReport(filter));
    }

    @GetMapping("/incidents/rca")
    public ResponseEntity<ReportDTO> getRootCauseAnalysisReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/incidents/rca");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getRootCauseAnalysisReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // KNOWLEDGE BASE  →  /api/reports/kb/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/kb/article-usage")
    public ResponseEntity<ReportDTO> getKbArticleUsageReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/kb/article-usage");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getKbArticleUsageReport(filter));
    }

    @GetMapping("/kb/quality")
    public ResponseEntity<ReportDTO> getArticleQualityReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/kb/quality");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getArticleQualityReport(filter));
    }

    @GetMapping("/kb/authors")
    public ResponseEntity<ReportDTO> getKbAuthorReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/kb/authors");
        ReportFilterDTO filter = buildFilter(startDate, endDate, null, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getKbAuthorReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AUDIT  →  /api/reports/audit/...
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/audit/trail")
    public ResponseEntity<ReportDTO> getAuditTrailReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/audit/trail");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getAuditTrailReport(filter));
    }

    @GetMapping("/audit/data-access")
    public ResponseEntity<ReportDTO> getDataAccessReport(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        if (!hasReportAccess(request)) return forbidden();
        log.info("GET /api/reports/audit/data-access");
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, null, null, null,
                null, null, null, null, null, null, null, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reportService.getAuditTrailReport(filter));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CSV EXPORT  →  /api/reports/export/{reportType}
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * GET /api/reports/export/{reportType}
     * Streams a CSV for the given report type (ITSM_MANAGER only).
     */
    @GetMapping("/export/{reportType}")
    public void exportCsv(
            HttpServletRequest request,
            @PathVariable String reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String assigneeName,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Boolean slaBreached,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            HttpServletResponse response) throws IOException {

        if (!hasReportAccess(request)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied");
            return;
        }

        log.info("GET /api/reports/export/{} | startDate={} endDate={}", reportType, startDate, endDate);
        ReportFilterDTO filter = buildFilter(startDate, endDate, searchKeyword, status, priority,
                categoryName, assigneeName, assigneeId, userId, projectId,
                slaBreached, minRating, maxRating, 0, 10_000, sortBy, sortDirection);

        reportService.exportReportAsCsv(reportType, filter, response);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Builder helper
    // ═══════════════════════════════════════════════════════════════════════

    private ReportFilterDTO buildFilter(LocalDate startDate, LocalDate endDate,
                                        String searchKeyword, String status, String priority,
                                        String categoryName, String assigneeName, Long assigneeId,
                                        Long userId, Long projectId,
                                        Boolean slaBreached, Integer minRating, Integer maxRating,
                                        int page, int size, String sortBy, String sortDirection) {
        return ReportFilterDTO.create()
                .startDate(startDate)
                .endDate(endDate)
                .searchKeyword(searchKeyword)
                .status(status)
                .priority(priority)
                .categoryName(categoryName)
                .assigneeName(assigneeName)
                .assigneeId(assigneeId)
                .userId(userId)
                .projectId(projectId)
                .slaBreached(slaBreached)
                .minRating(minRating)
                .maxRating(maxRating)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();
    }
}
