package com.rvz.reportservice.controller;

import com.rvz.reportservice.dto.DashboardDTO;
import com.rvz.reportservice.dto.ScheduleReportRequest;
import com.rvz.reportservice.dto.ReportDTO;
import com.rvz.reportservice.dto.ReportFilterDTO;
import com.rvz.reportservice.entity.ReportSchedule;
import com.rvz.reportservice.repository.ReportScheduleRepository;
import com.rvz.reportservice.repository.TicketRepository;
import com.rvz.reportservice.service.ReportService;
import com.rvz.reportservice.util.ExcelGeneratorUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Dedicated controller for three user stories that extend the report-service:
 *
 *  US-94 — GET  /api/reports/dashboard          → prebuilt ITSM Manager dashboard
 *  US-96 — POST /api/reports/schedules           → save a scheduled report
 *          GET  /api/reports/schedules           → list active schedules
 *          DELETE /api/reports/schedules/{id}    → delete a schedule
 *  US-97 — GET  /api/reports/export-excel/{type} → download .xlsx
 *
 * Role guard: same as ReportController — ITSM_MANAGER, ADMIN, MANAGER, AGENT.
 * For export-excel Admin-only is enforced by checking that ADMIN role is present
 * (US-97 negative: "Non-Admin role → export button not visible or access blocked").
 */
@RestController
@RequestMapping("/api/reports")
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);

    private static final List<String> REPORT_ROLES  = List.of("ITSM_MANAGER", "ADMIN", "MANAGER", "AGENT");
    private static final List<String> ADMIN_ROLES   = List.of("ADMIN", "ITSM_MANAGER");

    private final TicketRepository          ticketRepo;
    private final ReportScheduleRepository  scheduleRepo;
    private final ReportService             reportService;
    private final ExcelGeneratorUtil        excelUtil;
    private final ObjectMapper              objectMapper;

    public DashboardController(TicketRepository ticketRepo,
                               ReportScheduleRepository scheduleRepo,
                               ReportService reportService,
                               ExcelGeneratorUtil excelUtil,
                               ObjectMapper objectMapper) {
        this.ticketRepo   = ticketRepo;
        this.scheduleRepo = scheduleRepo;
        this.reportService = reportService;
        this.excelUtil    = excelUtil;
        this.objectMapper = objectMapper;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Role helpers
    // ═══════════════════════════════════════════════════════════════════════

    private boolean hasRole(HttpServletRequest req, List<String> allowed) {
        String header = req.getHeader("X-User-Roles");
        if (header == null || header.isBlank()) return true; // direct / dev call
        List<String> roles = Arrays.asList(header.split(","));
        return roles.stream().map(String::trim)
                .anyMatch(r -> allowed.stream().anyMatch(r::equalsIgnoreCase));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // US-94 — Prebuilt ITSM Dashboard
    // GET /api/reports/dashboard
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Returns aggregated real-time ticket pipeline, SLA monitoring, and support
     * performance data for the ITSM Manager dashboard.
     *
     * Positive (US-94):
     *   1. Dashboard loads showing tickets in progress, completed, rejected.
     *   2. SLA status per ticket — On Track, Approaching Breach, Breached.
     *   3. Support Person performance metrics visible.
     *   4. All data reflects real-time ticket state.
     *
     * Negative (US-94):
     *   1. No tickets → dashboard shows zero values.
     *   2. Insufficient role → 403 Access Denied.
     *   3. Data service unavailable → 500 (let GlobalExceptionHandler surface message).
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpServletRequest req) {
        if (!hasRole(req, REPORT_ROLES)) {
            log.warn("Dashboard access denied — missing required role");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access Denied: insufficient permissions to view dashboard"));
        }

        log.info("GET /api/reports/dashboard");

        DashboardDTO dto = new DashboardDTO();
        dto.setGeneratedAt(LocalDateTime.now());

        // ── Ticket pipeline ───────────────────────────────────────────────────
        long total       = ticketRepo.count();
        long open        = ticketRepo.countByStatus(com.rvz.reportservice.entity.Ticket.TicketStatus.OPEN);
        long inProgress  = ticketRepo.countByStatus(com.rvz.reportservice.entity.Ticket.TicketStatus.IN_PROGRESS);
        long resolved    = ticketRepo.countByStatus(com.rvz.reportservice.entity.Ticket.TicketStatus.RESOLVED);
        long closed      = ticketRepo.countByStatus(com.rvz.reportservice.entity.Ticket.TicketStatus.CLOSED);
        long cancelled   = ticketRepo.countByStatus(com.rvz.reportservice.entity.Ticket.TicketStatus.CANCELLED);
        long onHold      = ticketRepo.countByStatus(com.rvz.reportservice.entity.Ticket.TicketStatus.ON_HOLD);
        long reopened    = ticketRepo.countByStatus(com.rvz.reportservice.entity.Ticket.TicketStatus.REOPENED);
        long unassigned  = ticketRepo.countUnassignedOpenTickets();

        dto.setTotalTickets(total);
        dto.setOpenTickets(open);
        dto.setInProgressTickets(inProgress);
        dto.setResolvedTickets(resolved);
        dto.setClosedTickets(closed);
        dto.setRejectedTickets(cancelled);   // "rejected" in user story = CANCELLED
        dto.setOnHoldTickets(onHold);
        dto.setReopenedTickets(reopened);
        dto.setUnassignedTickets(unassigned);

        Map<String, Long> pipeline = new LinkedHashMap<>();
        pipeline.put("OPEN",        open);
        pipeline.put("IN_PROGRESS", inProgress);
        pipeline.put("ON_HOLD",     onHold);
        pipeline.put("RESOLVED",    resolved);
        pipeline.put("CLOSED",      closed);
        pipeline.put("REOPENED",    reopened);
        pipeline.put("CANCELLED",   cancelled);
        dto.setPipelineBreakdown(pipeline);

        // ── SLA monitoring: On Track / Approaching Breach / Breached ─────────
        // "Approaching Breach" = SLA deadline within next 2 hours and not yet breached
        LocalDateTime now          = LocalDateTime.now();
        LocalDateTime twoHoursOut  = now.plusHours(2);

        List<com.rvz.reportservice.entity.Ticket> allActiveTickets =
            ticketRepo.findAll().stream()
                .filter(t -> t.getStatus() != com.rvz.reportservice.entity.Ticket.TicketStatus.CLOSED
                          && t.getStatus() != com.rvz.reportservice.entity.Ticket.TicketStatus.CANCELLED
                          && t.getStatus() != com.rvz.reportservice.entity.Ticket.TicketStatus.RESOLVED)
                .toList();

        long breached         = allActiveTickets.stream().filter(t -> Boolean.TRUE.equals(t.getSlaBreached())).count();
        long approachingBreach = allActiveTickets.stream()
                .filter(t -> !Boolean.TRUE.equals(t.getSlaBreached())
                          && t.getSlaDeadline() != null
                          && t.getSlaDeadline().isAfter(now)
                          && t.getSlaDeadline().isBefore(twoHoursOut))
                .count();
        long onTrack = Math.max(0, allActiveTickets.size() - breached - approachingBreach);

        dto.setSlaBreachedCount(breached);
        dto.setSlaApproachingBreachCount(approachingBreach);
        dto.setSlaOnTrackCount(onTrack);

        long slaTotal = open + inProgress + onHold + reopened;
        double compliance = slaTotal > 0
                ? Math.round((onTrack * 10000.0 / slaTotal)) / 100.0
                : 100.0;
        dto.setSlaCompliancePercentage(compliance);

        // ── Support Person performance ────────────────────────────────────────
        List<Map<String, Object>> rawAssignee = ticketRepo.countGroupByAssignee();
        List<Map<String, Object>> supportPerf = new ArrayList<>();
        for (Map<String, Object> row : rawAssignee) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("supportPerson", row.get("assignee"));
            entry.put("totalAssigned", row.get("count"));
            supportPerf.add(entry);
        }
        dto.setSupportPerformance(supportPerf);

        // ── Recent 10 tickets ─────────────────────────────────────────────────
        List<com.rvz.reportservice.entity.Ticket> recent =
            ticketRepo.findAll(
                org.springframework.data.domain.PageRequest.of(0, 10,
                    org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
            ).getContent();

        List<Map<String, Object>> recentList = recent.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("ticketId",     t.getTicketId());
            m.put("ticketNumber", t.getTicketNumber());
            m.put("subject",      t.getSubject());
            m.put("status",       t.getStatus());
            m.put("priority",     t.getPriority());
            m.put("assigneeName", t.getAssigneeName());
            m.put("slaBreached",  t.getSlaBreached());
            m.put("slaDeadline",  t.getSlaDeadline());
            m.put("createdAt",    t.getCreatedAt());
            return m;
        }).toList();
        dto.setRecentTickets(recentList);

        return ResponseEntity.ok(dto);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // US-97 — Excel Export
    // GET /api/reports/export-excel/{reportType}
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Downloads a report as an Excel (.xlsx) file.
     *
     * US-97 positive:
     *   1. .xlsx downloads with all report data.
     *   2. Column headers match report fields.
     *   3. Data matches system report view.
     *   4. File opens without errors in Excel.
     *
     * US-97 negative:
     *   1. No data → headers-only sheet exported.
     *   2. Export fails → 500 with message "Export failed, please try again".
     *   3. Non-Admin → 403 Access Denied.
     */
    @GetMapping("/export-excel/{reportType}")
    public void exportExcel(
            HttpServletRequest req,
            @PathVariable String reportType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String assigneeName,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long projectId,
            HttpServletResponse response) throws IOException {

        // US-97 negative #3: non-Admin blocked
        if (!hasRole(req, ADMIN_ROLES)) {
            log.warn("Excel export denied — caller lacks ADMIN/ITSM_MANAGER role");
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: export requires Admin or ITSM Manager role");
            return;
        }

        log.info("GET /api/reports/export-excel/{}", reportType);

        try {
            ReportFilterDTO filter = ReportFilterDTO.create()
                    .status(status).priority(priority).categoryName(categoryName)
                    .assigneeName(assigneeName).assigneeId(assigneeId)
                    .userId(userId).projectId(projectId)
                    .page(0).size(10_000)
                    .sortBy("createdAt").sortDirection("desc")
                    .build();

            // Reuse existing CSV export logic to get a populated ReportDTO
            // We delegate to the existing exportReportAsCsv service but capture the DTO instead.
            // For Excel we call the report service directly and pass it to Excel util.
            ReportDTO report = fetchReportForType(reportType, filter);
            excelUtil.exportToExcel(reportType, report, response);

        } catch (Exception e) {
            log.error("Excel export failed for reportType={}: {}", reportType, e.getMessage(), e);
            if (!response.isCommitted()) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                        "Export failed, please try again");
            }
        }
    }

    // ── Resolve report type to ReportDTO ─────────────────────────────────────

    private ReportDTO fetchReportForType(String reportType, ReportFilterDTO filter) {
        return switch (reportType.toLowerCase()) {
            case "ticket-volume",     "tickets-volume"      -> reportService.getTicketVolumeReport(filter);
            case "ticket-status",     "tickets-status"      -> reportService.getTicketStatusReport(filter);
            case "assignment",        "tickets-assignment"  -> reportService.getAssignmentReport(filter);
            case "ticket-resolution", "tickets-resolution"  -> reportService.getTicketResolutionReport(filter);
            case "reopened-tickets",  "tickets-reopened"    -> reportService.getReopenedTicketsReport(filter);
            case "draft-tickets",     "tickets-drafts"      -> reportService.getDraftTicketsReport(filter);
            case "advanced-ticketing","tickets-advanced"    -> reportService.getAdvancedTicketingReport(filter);
            case "auto-closure",      "tickets-auto-closure"-> reportService.getAutoClosureReport(filter);
            case "sla-breach",        "sla-breaches"        -> reportService.getSlaBreachReport(filter);
            case "sla-compliance"                           -> reportService.getSlaComplianceReport(filter);
            case "sla-summary",       "sla-on-hold"         -> reportService.getSlaOnHoldReport(filter);
            case "sla-policy"                               -> reportService.getSlaPolicyEffectivenessReport(filter);
            case "user-activity",     "users-activity"      -> reportService.getUserActivityReport(filter);
            case "user-roles"                               -> reportService.getRoleDistributionReport(filter);
            case "approval-status",   "approvals-queue"     -> reportService.getApprovalQueueReport(filter);
            case "approval-history"                         -> reportService.getApproverPerformanceReport(filter);
            case "change-approval",   "approvals-change"    -> reportService.getChangeApprovalReport(filter);
            case "csat-scores",       "csat-scores-report"  -> reportService.getCsatScoreReport(filter);
            case "agent-csat"                               -> reportService.getAgentCsatReport(filter);
            case "incident-volume"                          -> reportService.getIncidentVolumeReport(filter);
            case "audit-log",         "audit-trail"         -> reportService.getAuditTrailReport(filter);
            default                                         -> reportService.getTicketVolumeReport(filter);
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // US-96 — Schedule Reports
    // POST   /api/reports/schedules
    // GET    /api/reports/schedules
    // DELETE /api/reports/schedules/{id}
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Save a new report schedule.
     *
     * US-96 positive:
     *   1. Schedule saved and listed under active schedules.
     *   2. ITSM Manager receives confirmation.
     *
     * US-96 negative:
     *   1. No recipients → 400 "At least one recipient is required" (validated by @NotEmpty on DTO).
     *   2. Invalid email → 400 validation error.
     *   3. Email service unavailable → schedule is saved; delivery failure logged.
     */
    @PostMapping("/schedules")
    public ResponseEntity<?> createSchedule(
            HttpServletRequest req,
            @Valid @RequestBody ScheduleReportRequest body) {

        if (!hasRole(req, REPORT_ROLES)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access Denied"));
        }

        log.info("POST /api/reports/schedules reportType={} frequency={}", body.getReportType(), body.getFrequency());

        // Validate frequency
        String freq = body.getFrequency().toUpperCase();
        if (!List.of("DAILY", "WEEKLY", "MONTHLY").contains(freq)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "frequency must be one of DAILY, WEEKLY, MONTHLY"));
        }

        ReportSchedule schedule = new ReportSchedule();
        schedule.setReportType(body.getReportType());
        schedule.setFrequency(freq);
        schedule.setRecipients(String.join(",", body.getRecipients()));

        // Serialize filter snapshot if provided
        if (body.getFilter() != null) {
            try {
                schedule.setFilterJson(objectMapper.writeValueAsString(body.getFilter()));
            } catch (Exception e) {
                log.warn("Could not serialize filter for schedule: {}", e.getMessage());
            }
        }

        // Compute next run time
        schedule.setNextRunAt(computeNextRun(freq));
        ReportSchedule saved = scheduleRepo.save(schedule);

        log.info("Schedule saved id={} nextRun={}", saved.getId(), saved.getNextRunAt());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("message", "Schedule saved successfully");
        resp.put("scheduleId", saved.getId());
        resp.put("reportType", saved.getReportType());
        resp.put("frequency", saved.getFrequency());
        resp.put("recipients", body.getRecipients());
        resp.put("nextRunAt", saved.getNextRunAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /** List all active schedules. */
    @GetMapping("/schedules")
    public ResponseEntity<?> listSchedules(HttpServletRequest req) {
        if (!hasRole(req, REPORT_ROLES)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied"));
        }
        List<ReportSchedule> all = scheduleRepo.findAllByActiveTrue();
        List<Map<String, Object>> result = all.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("scheduleId",  s.getId());
            m.put("reportType",  s.getReportType());
            m.put("frequency",   s.getFrequency());
            m.put("recipients",  Arrays.asList(s.getRecipients().split(",")));
            m.put("createdAt",   s.getCreatedAt());
            m.put("nextRunAt",   s.getNextRunAt());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    /** Deactivate (soft-delete) a schedule. */
    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<?> deleteSchedule(HttpServletRequest req, @PathVariable Long id) {
        if (!hasRole(req, REPORT_ROLES)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied"));
        }
        return scheduleRepo.findById(id).map(s -> {
            s.setActive(false);
            scheduleRepo.save(s);
            log.info("Schedule {} deactivated", id);
            return ResponseEntity.ok(Map.of("message", "Schedule removed successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private LocalDateTime computeNextRun(String frequency) {
        return switch (frequency) {
            case "DAILY"   -> LocalDateTime.now().plusDays(1).withHour(8).withMinute(0).withSecond(0);
            case "WEEKLY"  -> LocalDateTime.now().plusWeeks(1).withHour(8).withMinute(0).withSecond(0);
            case "MONTHLY" -> LocalDateTime.now().plusMonths(1).withDayOfMonth(1).withHour(8).withMinute(0).withSecond(0);
            default        -> LocalDateTime.now().plusDays(1);
        };
    }
}
