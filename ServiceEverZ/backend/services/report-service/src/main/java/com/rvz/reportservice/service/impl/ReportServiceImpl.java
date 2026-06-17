package com.rvz.reportservice.service.impl;

import com.rvz.reportservice.dto.ReportDTO;
import com.rvz.reportservice.dto.ReportFilterDTO;
import com.rvz.reportservice.entity.*;
import com.rvz.reportservice.exception.InvalidFilterException;
import com.rvz.reportservice.mapper.ReportMapper;
import com.rvz.reportservice.repository.*;
import com.rvz.reportservice.specification.ReportSpecification;
import com.rvz.reportservice.service.ReportService;
import com.rvz.reportservice.util.CsvGeneratorUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportServiceImpl.class);

    private final TicketRepository     ticketRepository;
    private final SLARepository        slaRepository;
    private final FeedbackRepository   feedbackRepository;
    private final AuditRepository      auditRepository;
    private final IncidentRepository   incidentRepository;
    private final ApprovalRepository   approvalRepository;
    private final ProjectRepository    projectRepository;
    private final UserRepository       userRepository;
    private final KnowledgeBaseRepository kbRepository;
    private final ReportMapper         reportMapper;
    private final CsvGeneratorUtil     csvGeneratorUtil;

    public ReportServiceImpl(TicketRepository ticketRepository, SLARepository slaRepository,
                             FeedbackRepository feedbackRepository, AuditRepository auditRepository,
                             IncidentRepository incidentRepository, ApprovalRepository approvalRepository,
                             ProjectRepository projectRepository, UserRepository userRepository,
                             KnowledgeBaseRepository kbRepository, ReportMapper reportMapper,
                             CsvGeneratorUtil csvGeneratorUtil) {
        this.ticketRepository = ticketRepository;
        this.slaRepository = slaRepository;
        this.feedbackRepository = feedbackRepository;
        this.auditRepository = auditRepository;
        this.incidentRepository = incidentRepository;
        this.approvalRepository = approvalRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.kbRepository = kbRepository;
        this.reportMapper = reportMapper;
        this.csvGeneratorUtil = csvGeneratorUtil;
    }

    // ── Ticket Volume ─────────────────────────────────────────────────────────

    @Override
    public ReportDTO getTicketVolumeReport(ReportFilterDTO filter) {
        log.info("Generating ticket-volume report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);

        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        // Trend data (daily volume)
        List<Map<String, Object>> trendData = Collections.emptyList();
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            trendData = ticketRepository.dailyTicketVolume(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX)
            );
        }

        List<Map<String, Object>> rows = page.getContent()
                .stream()
                .map(reportMapper::ticketToRow)
                .collect(Collectors.toList());

        // FIX: Use date-filtered breakdowns so SummaryCards match the table rows
        List<Map<String, Object>> statusRaw, priorityRaw, categoryRaw;
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            LocalDateTime from = filter.getStartDate().atStartOfDay();
            LocalDateTime to   = filter.getEndDate().atTime(LocalTime.MAX);
            statusRaw   = ticketRepository.countGroupByStatusBetween(from, to);
            priorityRaw = ticketRepository.countGroupByPriorityBetween(from, to);
            categoryRaw = ticketRepository.countGroupByCategoryBetween(from, to);
        } else {
            statusRaw   = ticketRepository.countGroupByStatus();
            priorityRaw = ticketRepository.countGroupByPriority();
            categoryRaw = ticketRepository.countGroupByCategory();
        }

        ReportDTO dto = ReportDTO.create()
                .reportType("TICKET_VOLUME")
                .reportTitle("Ticket Volume Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalTickets(page.getTotalElements())
                .statusBreakdown(mapToLongMap(statusRaw, "status", "count"))
                .priorityBreakdown(mapToLongMap(priorityRaw, "priority", "count"))
                .categoryBreakdown(mapToLongMap(categoryRaw, "category", "count"))
                .trendData(trendData)
                .rows(rows)
                .appliedFilters(filter)
                .build();

        log.info("Ticket-volume report generated: totalRecords={}", page.getTotalElements());
        return dto;
    }

    // ── Ticket Status ─────────────────────────────────────────────────────────

    @Override
    public ReportDTO getTicketStatusReport(ReportFilterDTO filter) {
        log.info("Generating ticket-status report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        // FIX: Use date-filtered breakdown so SummaryCards match the table rows
        List<Map<String, Object>> statusRawDist;
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            statusRawDist = ticketRepository.countGroupByStatusBetween(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX));
        } else {
            statusRawDist = ticketRepository.countGroupByStatus();
        }
        Map<String, Long> statusBreakdown = mapToLongMap(statusRawDist, "status", "count");

        long total = statusBreakdown.values().stream().mapToLong(Long::longValue).sum();

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("TICKET_STATUS")
                .reportTitle("Ticket Status Distribution Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalTickets(total)
                .openTickets(statusBreakdown.getOrDefault("OPEN", 0L))
                .inProgressTickets(statusBreakdown.getOrDefault("IN_PROGRESS", 0L))
                .resolvedTickets(statusBreakdown.getOrDefault("RESOLVED", 0L))
                .closedTickets(statusBreakdown.getOrDefault("CLOSED", 0L))
                .reopenedTickets(statusBreakdown.getOrDefault("REOPENED", 0L))
                .cancelledTickets(statusBreakdown.getOrDefault("CANCELLED", 0L))
                .onHoldTickets(statusBreakdown.getOrDefault("ON_HOLD", 0L))
                .statusBreakdown(statusBreakdown)
                .priorityBreakdown(mapToLongMap(
                        filter.getStartDate() != null && filter.getEndDate() != null
                            ? ticketRepository.countGroupByPriorityBetween(filter.getStartDate().atStartOfDay(), filter.getEndDate().atTime(LocalTime.MAX))
                            : ticketRepository.countGroupByPriority(),
                        "priority", "count"))
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Assignment ────────────────────────────────────────────────────────────

    @Override
    public ReportDTO getAssignmentReport(ReportFilterDTO filter) {
        log.info("Generating assignment report with filter: {}", filter);
        validateDateRange(filter);

        List<Map<String, Object>> assigneeBreakdownRaw;
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            assigneeBreakdownRaw = ticketRepository.countGroupByAssigneeBetween(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX));
        } else {
            assigneeBreakdownRaw = ticketRepository.countGroupByAssignee();
        }

        Map<String, Long> assigneeBreakdown = mapToLongMap(assigneeBreakdownRaw, "assignee", "count");
        long unassigned = ticketRepository.countUnassignedOpenTickets();

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        // Enrich rows with unassigned marker
        Map<String, Object> unassignedSummary = new LinkedHashMap<>();
        unassignedSummary.put("label", "Unassigned Open Tickets");
        unassignedSummary.put("count", unassigned);

        List<Map<String, Object>> trendData = List.of(unassignedSummary);

        return ReportDTO.create()
                .reportType("ASSIGNMENT")
                .reportTitle("Ticket Assignment Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .assigneeBreakdown(assigneeBreakdown)
                .trendData(trendData)
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Reopened Tickets ──────────────────────────────────────────────────────

    @Override
    public ReportDTO getReopenedTicketsReport(ReportFilterDTO filter) {
        log.info("Generating reopened-tickets report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.reopenedWithFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        long totalReopened = ticketRepository.countReopenedTickets();

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("REOPENED")
                .reportTitle("Reopened Tickets Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .reopenedTickets(totalReopened)
                .categoryBreakdown(mapToLongMap(ticketRepository.countGroupByCategory(), "category", "count"))
                .assigneeBreakdown(mapToLongMap(ticketRepository.countGroupByAssignee(), "assignee", "count"))
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── SLA Compliance ────────────────────────────────────────────────────────

    @Override
    public ReportDTO getSlaComplianceReport(ReportFilterDTO filter) {
        log.info("Generating SLA compliance report with filter: {}", filter);
        validateDateRange(filter);

        long totalSla;
        long breachedCount;

        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            LocalDateTime from = filter.getStartDate().atStartOfDay();
            LocalDateTime to   = filter.getEndDate().atTime(LocalTime.MAX);
            totalSla     = slaRepository.countTotalBetween(from, to);
            breachedCount = slaRepository.countBreachedBetween(from, to);
        } else {
            totalSla     = slaRepository.count();
            breachedCount = slaRepository.countByBreached(true);
        }

        long compliantCount = totalSla - breachedCount;
        double compliancePct = totalSla > 0
                ? Math.round((compliantCount * 100.0 / totalSla) * 100.0) / 100.0
                : 0.0;

        Double avgResolution = slaRepository.avgResolutionTimeMinutes();
        Double avgResponse   = slaRepository.avgResponseTimeMinutes();

        // Row-level SLA data (paginated)
        Specification<SLA> slaSpec = buildSlaSpec(filter);
        Pageable pageable = buildPageable(filter);
        Page<SLA> page = slaRepository.findAll(slaSpec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::slaToRow).collect(Collectors.toList());

        List<Map<String, Object>> byCategoryRaw = slaRepository.slaComplianceByCategoryNative();
        List<Map<String, Object>> byAssigneeRaw = slaRepository.slaComplianceByAssignee();

        return ReportDTO.create()
                .reportType("SLA_COMPLIANCE")
                .reportTitle("SLA Compliance Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .slaCompliantCount(compliantCount)
                .slaBreachedCount(breachedCount)
                .slaCompliancePercentage(compliancePct)
                .averageResolutionTimeMinutes(avgResolution)
                .averageResponseTimeMinutes(avgResponse)
                .trendData(mergeSlaBreakdown(byCategoryRaw, byAssigneeRaw))
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── CSAT Score ────────────────────────────────────────────────────────────

    @Override
    public ReportDTO getCsatScoreReport(ReportFilterDTO filter) {
        log.info("Generating CSAT report with filter: {}", filter);
        validateDateRange(filter);

        Double avgRating;
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            avgRating = feedbackRepository.averageRatingBetween(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX));
        } else {
            avgRating = feedbackRepository.averageRating();
        }

        long positive = feedbackRepository.countPositiveFeedback();
        long negative = feedbackRepository.countNegativeFeedback();
        long total    = feedbackRepository.count();

        List<Map<String, Object>> ratingDist = feedbackRepository.countGroupByRating();
        List<Map<String, Object>> byAgent    = feedbackRepository.csatByAgent();
        List<Map<String, Object>> byCategory = feedbackRepository.csatByCategory();

        // Paginated rows — use feedback-aware pageable (submittedAt, not createdAt)
        Pageable pageable = buildFeedbackPageable(filter);
        Page<Feedback> page = feedbackRepository.findAll(buildFeedbackSpec(filter), pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::feedbackToRow).collect(Collectors.toList());

        // Trend: daily csat
        List<Map<String, Object>> trendData = Collections.emptyList();
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            trendData = feedbackRepository.dailyCsatTrend(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX));
        }

        // Combine agent + category breakdowns into trendData-style list
        List<Map<String, Object>> enrichedTrend = new ArrayList<>(trendData);
        enrichedTrend.addAll(byAgent);
        enrichedTrend.addAll(byCategory);

        return ReportDTO.create()
                .reportType("CSAT_SCORE")
                .reportTitle("CSAT Score Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .averageCsatScore(avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : null)
                .totalFeedbackCount(total)
                .positiveFeedbackCount(positive)
                .negativeFeedbackCount(negative)
                .trendData(enrichedTrend)
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Audit Trail ───────────────────────────────────────────────────────────

    @Override
    public ReportDTO getAuditTrailReport(ReportFilterDTO filter) {
        log.info("Generating audit-trail report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Audit> page;

        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            page = auditRepository.findByCreatedAtBetween(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX),
                    pageable);
        } else {
            page = auditRepository.findAll(pageable);
        }

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::auditToRow).collect(Collectors.toList());

        List<Map<String, Object>> actionBreakdown = auditRepository.countGroupByAction();
        List<Map<String, Object>> moduleBreakdown = auditRepository.countGroupByModule();
        List<Map<String, Object>> trend           = Collections.emptyList();
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            trend = auditRepository.dailyAuditVolume(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX));
        }

        List<Map<String, Object>> enriched = new ArrayList<>(trend);
        enriched.addAll(actionBreakdown);
        enriched.addAll(moduleBreakdown);

        return ReportDTO.create()
                .reportType("AUDIT_TRAIL")
                .reportTitle("Audit Trail Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .trendData(enriched)
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── CSV Export ────────────────────────────────────────────────────────────

    @Override
    public void exportReportAsCsv(String reportType, ReportFilterDTO filter,
                                  HttpServletResponse response) throws IOException {
        log.info("Exporting CSV for reportType={}", reportType);

        // Use a large page to pull all data for export (cap at 10,000)
        ReportFilterDTO exportFilter = ReportFilterDTO.create()
                .startDate(filter.getStartDate())
                .endDate(filter.getEndDate())
                .searchKeyword(filter.getSearchKeyword())
                .status(filter.getStatus())
                .priority(filter.getPriority())
                .categoryName(filter.getCategoryName())
                .assigneeName(filter.getAssigneeName())
                .assigneeId(filter.getAssigneeId())
                .userId(filter.getUserId())
                .projectId(filter.getProjectId())
                .slaBreached(filter.getSlaBreached())
                .minRating(filter.getMinRating())
                .maxRating(filter.getMaxRating())
                .page(0)
                .size(10_000)
                .sortBy(filter.getSortBy())
                .sortDirection(filter.getSortDirection())
                .build();

        ReportDTO report = switch (reportType.toLowerCase()) {
            case "ticket-volume"   -> getTicketVolumeReport(exportFilter);
            case "ticket-status"   -> getTicketStatusReport(exportFilter);
            case "assignment"      -> getAssignmentReport(exportFilter);
            case "reopened"        -> getReopenedTicketsReport(exportFilter);
            case "sla-compliance"  -> getSlaComplianceReport(exportFilter);
            case "csat-score"      -> getCsatScoreReport(exportFilter);
            case "audit-trail"     -> getAuditTrailReport(exportFilter);
            default -> throw new InvalidFilterException(
                    "reportType", reportType,
                    "Unknown report type. Valid values: ticket-volume, ticket-status, " +
                    "assignment, reopened, sla-compliance, csat-score, audit-trail");
        };

        csvGeneratorUtil.writeToResponse(response, reportType, report.getRows());
        log.info("CSV export completed for reportType={}, rows={}", reportType, report.getTotalRecords());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Pageable buildPageable(ReportFilterDTO filter) {
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDirection())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "createdAt";
        return PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(direction, sortBy));
    }

    /**
     * Feedback-specific pageable builder.
     * The Feedback entity uses {@code submittedAt} instead of {@code createdAt}.
     * Callers that pass the default sortBy="createdAt" from the controller would
     * otherwise cause a 500 because no such column exists on csat_survey.
     */
    private Pageable buildFeedbackPageable(ReportFilterDTO filter) {
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDirection())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        // Map generic "createdAt" (controller default) to the actual Feedback field
        String rawSort = filter.getSortBy() != null ? filter.getSortBy() : "submittedAt";
        String sortBy  = "createdAt".equalsIgnoreCase(rawSort) ? "submittedAt" : rawSort;
        return PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(direction, sortBy));
    }

    private void validateDateRange(ReportFilterDTO filter) {
        if (filter.getStartDate() != null && filter.getEndDate() != null
                && filter.getStartDate().isAfter(filter.getEndDate())) {
            throw new InvalidFilterException("startDate", filter.getStartDate(),
                    "startDate must not be after endDate");
        }
    }

    /**
     * Converts a list of raw query result maps into a {@code Map<String, Long>}
     * keyed by the string value of {@code keyField}, with long value from {@code valueField}.
     */
    private Map<String, Long> mapToLongMap(List<Map<String, Object>> raw,
                                           String keyField, String valueField) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (Map<String, Object> row : raw) {
            Object k = row.get(keyField);
            Object v = row.get(valueField);
            if (k != null && v != null) {
                result.put(k.toString(), ((Number) v).longValue());
            }
        }
        return result;
    }

    /** Minimal SLA specification (date range + breached flag). */
    private Specification<SLA> buildSlaSpec(ReportFilterDTO filter) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (filter.getStartDate() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("startedAt"),
                        filter.getStartDate().atStartOfDay()));
            if (filter.getEndDate() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("startedAt"),
                        filter.getEndDate().atTime(LocalTime.MAX)));
            if (filter.getSlaBreached() != null)
                predicates.add(cb.equal(root.get("breached"), filter.getSlaBreached()));
            if (filter.getAssigneeId() != null)
                predicates.add(cb.equal(root.get("assigneeId"), filter.getAssigneeId()));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    /** Minimal Feedback specification. */
    private Specification<Feedback> buildFeedbackSpec(ReportFilterDTO filter) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (filter.getStartDate() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("submittedAt"),
                        filter.getStartDate().atStartOfDay()));
            if (filter.getEndDate() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("submittedAt"),
                        filter.getEndDate().atTime(LocalTime.MAX)));
            if (filter.getMinRating() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), filter.getMinRating()));
            if (filter.getMaxRating() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("rating"), filter.getMaxRating()));
            if (filter.getAssigneeId() != null)
                predicates.add(cb.equal(root.get("resolvedById"), filter.getAssigneeId()));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    /** Merge SLA category and assignee breakdowns into a single trend-data list. */
    private List<Map<String, Object>> mergeSlaBreakdown(List<Map<String, Object>> byCategory,
                                                         List<Map<String, Object>> byAssignee) {
        List<Map<String, Object>> result = new ArrayList<>();
        byCategory.forEach(m -> {
            Map<String, Object> row = new LinkedHashMap<>(m);
            row.put("groupBy", "CATEGORY");
            result.add(row);
        });
        byAssignee.forEach(m -> {
            Map<String, Object> row = new LinkedHashMap<>(m);
            row.put("groupBy", "ASSIGNEE");
            result.add(row);
        });
        return result;
    }
    // ── Ticket Resolution ─────────────────────────────────────────────────────

    @Override
    public ReportDTO getTicketResolutionReport(ReportFilterDTO filter) {
        log.info("Generating ticket-resolution report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("TICKET_RESOLUTION")
                .reportTitle("Ticket Resolution Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .resolvedTickets(page.getTotalElements())
                .averageResolutionTimeMinutes(slaRepository.avgResolutionTimeMinutes())
                .categoryBreakdown(mapToLongMap(ticketRepository.countGroupByCategory(), "category", "count"))
                .assigneeBreakdown(mapToLongMap(ticketRepository.countGroupByAssignee(), "assignee", "count"))
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Draft Tickets ─────────────────────────────────────────────────────────

    @Override
    public ReportDTO getDraftTicketsReport(ReportFilterDTO filter) {
        log.info("Generating draft-tickets report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("DRAFT_TICKETS")
                .reportTitle("Draft Tickets Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalTickets(page.getTotalElements())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Advanced Ticketing ────────────────────────────────────────────────────

    @Override
    public ReportDTO getAdvancedTicketingReport(ReportFilterDTO filter) {
        log.info("Generating advanced-ticketing report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        Map<String, Long> statusBreakdown = mapToLongMap(ticketRepository.countGroupByStatus(), "status", "count");
        long total = statusBreakdown.values().stream().mapToLong(Long::longValue).sum();

        return ReportDTO.create()
                .reportType("ADVANCED_TICKETING")
                .reportTitle("Advanced Ticketing Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalTickets(total)
                .statusBreakdown(statusBreakdown)
                .priorityBreakdown(mapToLongMap(ticketRepository.countGroupByPriority(), "priority", "count"))
                .categoryBreakdown(mapToLongMap(ticketRepository.countGroupByCategory(), "category", "count"))
                .assigneeBreakdown(mapToLongMap(ticketRepository.countGroupByAssignee(), "assignee", "count"))
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Auto Closure ──────────────────────────────────────────────────────────

    @Override
    public ReportDTO getAutoClosureReport(ReportFilterDTO filter) {
        log.info("Generating auto-closure report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("AUTO_CLOSURE")
                .reportTitle("Auto Closure Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .closedTickets(page.getTotalElements())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── SLA Breach ────────────────────────────────────────────────────────────

    @Override
    public ReportDTO getSlaBreachReport(ReportFilterDTO filter) {
        log.info("Generating SLA breach report with filter: {}", filter);
        validateDateRange(filter);

        Specification<SLA> spec = buildSlaSpec(filter);
        Pageable pageable = buildPageable(filter);
        Page<SLA> page = slaRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::slaToRow).collect(Collectors.toList());

        long breachedCount = filter.getStartDate() != null && filter.getEndDate() != null
                ? slaRepository.countBreachedBetween(
                        filter.getStartDate().atStartOfDay(),
                        filter.getEndDate().atTime(LocalTime.MAX))
                : slaRepository.countByBreached(true);

        return ReportDTO.create()
                .reportType("SLA_BREACH")
                .reportTitle("SLA Breach Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .slaBreachedCount(breachedCount)
                .averageResolutionTimeMinutes(slaRepository.avgResolutionTimeMinutes())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── SLA On Hold ───────────────────────────────────────────────────────────

    @Override
    public ReportDTO getSlaOnHoldReport(ReportFilterDTO filter) {
        log.info("Generating SLA on-hold report with filter: {}", filter);
        validateDateRange(filter);

        Specification<SLA> spec = buildSlaSpec(filter);
        Pageable pageable = buildPageable(filter);
        Page<SLA> page = slaRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::slaToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("SLA_ON_HOLD")
                .reportTitle("SLA On Hold Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .onHoldTickets(page.getTotalElements())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── SLA Policy Effectiveness ──────────────────────────────────────────────

    @Override
    public ReportDTO getSlaPolicyEffectivenessReport(ReportFilterDTO filter) {
        log.info("Generating SLA policy-effectiveness report with filter: {}", filter);
        validateDateRange(filter);

        long total = slaRepository.count();
        long breached = slaRepository.countByBreached(true);
        long compliant = total - breached;
        double pct = total > 0 ? Math.round((compliant * 100.0 / total) * 100.0) / 100.0 : 0.0;

        Specification<SLA> spec = buildSlaSpec(filter);
        Pageable pageable = buildPageable(filter);
        Page<SLA> page = slaRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::slaToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("SLA_POLICY_EFFECTIVENESS")
                .reportTitle("SLA Policy Effectiveness Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .slaCompliantCount(compliant)
                .slaBreachedCount(breached)
                .slaCompliancePercentage(pct)
                .averageResolutionTimeMinutes(slaRepository.avgResolutionTimeMinutes())
                .averageResponseTimeMinutes(slaRepository.avgResponseTimeMinutes())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── User Activity ─────────────────────────────────────────────────────────

    @Override
    public ReportDTO getUserActivityReport(ReportFilterDTO filter) {
        log.info("Generating user-activity report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Audit> page;
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            page = auditRepository.findByCreatedAtBetween(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX), pageable);
        } else {
            page = auditRepository.findAll(pageable);
        }

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::auditToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("USER_ACTIVITY")
                .reportTitle("User Activity Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .trendData(auditRepository.countGroupByAction())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Role Distribution ─────────────────────────────────────────────────────

    @Override
    public ReportDTO getRoleDistributionReport(ReportFilterDTO filter) {
        log.info("Generating role-distribution report with filter: {}", filter);

        Pageable pageable = buildPageable(filter);
        // Apply keyword/userId search AND date range so User Roles Report returns all matching users
        Specification<User> userSpec = buildUserSpec(filter);
        Page<User> page = userRepository.findAll(userSpec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::userToRow).collect(Collectors.toList());

        Map<String, Long> roleBreakdown = mapToLongMap(userRepository.countGroupByRole(), "role", "count");

        return ReportDTO.create()
                .reportType("ROLE_DISTRIBUTION")
                .reportTitle("Role Distribution Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .statusBreakdown(roleBreakdown)
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Bulk Upload Audit ─────────────────────────────────────────────────────

    @Override
    public ReportDTO getBulkUploadAuditReport(ReportFilterDTO filter) {
        log.info("Generating bulk-upload-audit report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Audit> page;
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            page = auditRepository.findByCreatedAtBetween(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX), pageable);
        } else {
            page = auditRepository.findAll(pageable);
        }

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::auditToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("BULK_UPLOAD_AUDIT")
                .reportTitle("Bulk Upload Audit Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Location Assignment ───────────────────────────────────────────────────

    @Override
    public ReportDTO getLocationAssignmentReport(ReportFilterDTO filter) {
        log.info("Generating location-assignment report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("LOCATION_ASSIGNMENT")
                .reportTitle("Location Assignment Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .assigneeBreakdown(mapToLongMap(ticketRepository.countGroupByAssignee(), "assignee", "count"))
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Login Security ────────────────────────────────────────────────────────

    @Override
    public ReportDTO getLoginSecurityReport(ReportFilterDTO filter) {
        log.info("Generating login-security report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Audit> page;
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            page = auditRepository.findByCreatedAtBetween(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX), pageable);
        } else {
            page = auditRepository.findAll(pageable);
        }

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::auditToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("LOGIN_SECURITY")
                .reportTitle("Login Security Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Approval Queue ────────────────────────────────────────────────────────

    @Override
    public ReportDTO getApprovalQueueReport(ReportFilterDTO filter) {
        log.info("Generating approval-queue report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Approval> page = approvalRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::approvalToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("APPROVAL_QUEUE")
                .reportTitle("Approval Queue Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Approver Performance ──────────────────────────────────────────────────

    @Override
    public ReportDTO getApproverPerformanceReport(ReportFilterDTO filter) {
        log.info("Generating approver-performance report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Approval> page = approvalRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::approvalToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("APPROVER_PERFORMANCE")
                .reportTitle("Approver Performance Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Change Approval ───────────────────────────────────────────────────────

    @Override
    public ReportDTO getChangeApprovalReport(ReportFilterDTO filter) {
        log.info("Generating change-approval report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Approval> page = approvalRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::approvalToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("CHANGE_APPROVAL")
                .reportTitle("Change Approval Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Agent CSAT ────────────────────────────────────────────────────────────

    @Override
    public ReportDTO getAgentCsatReport(ReportFilterDTO filter) {
        log.info("Generating agent-CSAT report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildFeedbackPageable(filter);
        Page<Feedback> page = feedbackRepository.findAll(buildFeedbackSpec(filter), pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::feedbackToRow).collect(Collectors.toList());

        Double avg = feedbackRepository.averageRating();
        long pos = feedbackRepository.countPositiveFeedback();
        long neg = feedbackRepository.countNegativeFeedback();
        long tot = feedbackRepository.count();

        return ReportDTO.create()
                .reportType("AGENT_CSAT")
                .reportTitle("Agent CSAT Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .averageCsatScore(avg != null ? Math.round(avg * 100.0) / 100.0 : null)
                .trendData(feedbackRepository.csatByAgent())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Category CSAT ─────────────────────────────────────────────────────────

    @Override
    public ReportDTO getCategoryCsatReport(ReportFilterDTO filter) {
        log.info("Generating category-CSAT report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildFeedbackPageable(filter);
        Page<Feedback> page = feedbackRepository.findAll(buildFeedbackSpec(filter), pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::feedbackToRow).collect(Collectors.toList());

        Double avg = feedbackRepository.averageRating();
        long pos = feedbackRepository.countPositiveFeedback();
        long neg = feedbackRepository.countNegativeFeedback();
        long tot = feedbackRepository.count();

        return ReportDTO.create()
                .reportType("CATEGORY_CSAT")
                .reportTitle("Category CSAT Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .averageCsatScore(avg != null ? Math.round(avg * 100.0) / 100.0 : null)
                .trendData(feedbackRepository.csatByCategory())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Project Overview ──────────────────────────────────────────────────────

    @Override
    public ReportDTO getProjectOverviewReport(ReportFilterDTO filter) {
        log.info("Generating project-overview report with filter: {}", filter);

        Pageable pageable = buildPageable(filter);
        Page<Project> page = projectRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::projectToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("PROJECT_OVERVIEW")
                .reportTitle("Project Overview Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Resource Allocation ───────────────────────────────────────────────────

    @Override
    public ReportDTO getResourceAllocationReport(ReportFilterDTO filter) {
        log.info("Generating resource-allocation report with filter: {}", filter);

        Pageable pageable = buildPageable(filter);
        Page<Project> page = projectRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::projectToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("RESOURCE_ALLOCATION")
                .reportTitle("Resource Allocation Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Resource Change History ───────────────────────────────────────────────

    @Override
    public ReportDTO getResourceChangeHistoryReport(ReportFilterDTO filter) {
        log.info("Generating resource-change-history report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Audit> page;
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            page = auditRepository.findByCreatedAtBetween(
                    filter.getStartDate().atStartOfDay(),
                    filter.getEndDate().atTime(LocalTime.MAX), pageable);
        } else {
            page = auditRepository.findAll(pageable);
        }

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::auditToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("RESOURCE_CHANGE_HISTORY")
                .reportTitle("Resource Change History Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Most Requested Services ───────────────────────────────────────────────

    @Override
    public ReportDTO getMostRequestedServicesReport(ReportFilterDTO filter) {
        log.info("Generating most-requested-services report with filter: {}", filter);
        validateDateRange(filter);

        Specification<Ticket> spec = ReportSpecification.ticketFilter(filter);
        Pageable pageable = buildPageable(filter);
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::ticketToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("MOST_REQUESTED_SERVICES")
                .reportTitle("Most Requested Services Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .categoryBreakdown(mapToLongMap(ticketRepository.countGroupByCategory(), "category", "count"))
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Service Approval Rate ─────────────────────────────────────────────────

    @Override
    public ReportDTO getServiceApprovalRateReport(ReportFilterDTO filter) {
        log.info("Generating service-approval-rate report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Approval> page = approvalRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::approvalToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("SERVICE_APPROVAL_RATE")
                .reportTitle("Service Approval Rate Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Incident Volume ───────────────────────────────────────────────────────

    @Override
    public ReportDTO getIncidentVolumeReport(ReportFilterDTO filter) {
        log.info("Generating incident-volume report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Incident> page = incidentRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::incidentToRow).collect(Collectors.toList());

        long total = incidentRepository.count();

        return ReportDTO.create()
                .reportType("INCIDENT_VOLUME")
                .reportTitle("Incident Volume Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalIncidents(total)
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Problem Incident Linkage ──────────────────────────────────────────────

    @Override
    public ReportDTO getProblemIncidentLinkageReport(ReportFilterDTO filter) {
        log.info("Generating problem-incident-linkage report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Incident> page = incidentRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::incidentToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("PROBLEM_INCIDENT_LINKAGE")
                .reportTitle("Problem Incident Linkage Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalIncidents(page.getTotalElements())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Root Cause Analysis ───────────────────────────────────────────────────

    @Override
    public ReportDTO getRootCauseAnalysisReport(ReportFilterDTO filter) {
        log.info("Generating root-cause-analysis report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<Incident> page = incidentRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::incidentToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("ROOT_CAUSE_ANALYSIS")
                .reportTitle("Root Cause Analysis Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── KB Article Usage ──────────────────────────────────────────────────────

    @Override
    public ReportDTO getKbArticleUsageReport(ReportFilterDTO filter) {
        log.info("Generating KB article-usage report with filter: {}", filter);
        validateDateRange(filter);

        Pageable pageable = buildPageable(filter);
        Page<KnowledgeBase> page = kbRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::kbToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("KB_ARTICLE_USAGE")
                .reportTitle("KB Article Usage Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── Article Quality ───────────────────────────────────────────────────────

    @Override
    public ReportDTO getArticleQualityReport(ReportFilterDTO filter) {
        log.info("Generating article-quality report with filter: {}", filter);

        Pageable pageable = buildPageable(filter);
        Page<KnowledgeBase> page = kbRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::kbToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("ARTICLE_QUALITY")
                .reportTitle("Article Quality Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    // ── KB Author ─────────────────────────────────────────────────────────────

    @Override
    public ReportDTO getKbAuthorReport(ReportFilterDTO filter) {
        log.info("Generating KB author report with filter: {}", filter);

        Pageable pageable = buildPageable(filter);
        Page<KnowledgeBase> page = kbRepository.findAll(pageable);

        List<Map<String, Object>> rows = page.getContent().stream()
                .map(reportMapper::kbToRow).collect(Collectors.toList());

        return ReportDTO.create()
                .reportType("KB_AUTHOR")
                .reportTitle("KB Author Report")
                .generatedAt(LocalDateTime.now())
                .totalRecords(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .rows(rows)
                .appliedFilters(filter)
                .build();
    }

    /** Specification for filtering User records by keyword, userId, or date range. */
    private Specification<User> buildUserSpec(ReportFilterDTO filter) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (filter.getUserId() != null) {
                predicates.add(cb.equal(root.get("id"), filter.getUserId()));
            }
            if (filter.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"),
                        filter.getStartDate().atStartOfDay()));
            }
            if (filter.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"),
                        filter.getEndDate().atTime(LocalTime.MAX)));
            }
            if (org.springframework.util.StringUtils.hasText(filter.getSearchKeyword())) {
                String kw = "%" + filter.getSearchKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("firstName")),  kw),
                    cb.like(cb.lower(root.get("lastName")),   kw),
                    cb.like(cb.lower(root.get("email")),      kw),
                    cb.like(cb.lower(root.get("department")), kw),
                    cb.like(cb.lower(root.get("role")),       kw)
                ));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
