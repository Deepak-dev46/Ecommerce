package com.rvz.reportservice.specification;

import com.rvz.reportservice.dto.ReportFilterDTO;
import com.rvz.reportservice.entity.Ticket;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds JPA {@link Specification} predicates for {@link Ticket} queries
 * based on a {@link ReportFilterDTO}.  Each predicate is optional — only
 * non-null / non-blank filter fields generate SQL conditions.
 */
public class ReportSpecification {

    private ReportSpecification() { /* utility class */ }

    /**
     * Builds a Specification<Ticket> from the supplied filter DTO.
     */
    public static Specification<Ticket> ticketFilter(ReportFilterDTO filter) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // ── Date range on createdAt ───────────────────────────────────────
            if (filter.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getStartDate().atStartOfDay()
                ));
            }
            if (filter.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getEndDate().atTime(LocalTime.MAX)
                ));
            }

            // ── Free-text keyword ─────────────────────────────────────────────
            if (StringUtils.hasText(filter.getSearchKeyword())) {
                String kw = "%" + filter.getSearchKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("ticketNumber")), kw),
                        cb.like(cb.lower(root.get("subject")), kw),
                        cb.like(cb.lower(root.get("requesterName")), kw),
                        cb.like(cb.lower(root.get("assigneeName")), kw),
                        cb.like(cb.lower(root.get("categoryName")), kw)
                ));
            }

            // ── Status ────────────────────────────────────────────────────────
            if (StringUtils.hasText(filter.getStatus())) {
                try {
                    Ticket.TicketStatus s = Ticket.TicketStatus.valueOf(filter.getStatus().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), s));
                } catch (IllegalArgumentException ignored) { /* invalid enum value — skip */ }
            }

            // ── Priority ──────────────────────────────────────────────────────
            if (StringUtils.hasText(filter.getPriority())) {
                try {
                    Ticket.TicketPriority p = Ticket.TicketPriority.valueOf(filter.getPriority().toUpperCase());
                    predicates.add(cb.equal(root.get("priority"), p));
                } catch (IllegalArgumentException ignored) { }
            }

            // ── Category ──────────────────────────────────────────────────────
            if (StringUtils.hasText(filter.getCategoryName())) {
                predicates.add(cb.like(
                        cb.lower(root.get("categoryName")),
                        "%" + filter.getCategoryName().toLowerCase() + "%"
                ));
            }

            // ── Sub-category ──────────────────────────────────────────────────
            if (StringUtils.hasText(filter.getSubCategoryName())) {
                predicates.add(cb.like(
                        cb.lower(root.get("subCategoryName")),
                        "%" + filter.getSubCategoryName().toLowerCase() + "%"
                ));
            }

            // ── Assignee (name or ID) ──────────────────────────────────────────
            if (StringUtils.hasText(filter.getAssigneeName())) {
                predicates.add(cb.like(
                        cb.lower(root.get("assigneeName")),
                        "%" + filter.getAssigneeName().toLowerCase() + "%"
                ));
            }
            if (filter.getAssigneeId() != null) {
                predicates.add(cb.equal(root.get("assigneeId"), filter.getAssigneeId()));
            }

            // ── Requester (userId) ────────────────────────────────────────────
            if (filter.getUserId() != null) {
                predicates.add(cb.equal(root.get("userId"), filter.getUserId()));
            }

            // ── Project ───────────────────────────────────────────────────────
            if (filter.getProjectId() != null) {
                predicates.add(cb.equal(root.get("projectId"), filter.getProjectId()));
            }

            // ── Location ──────────────────────────────────────────────────────
            if (StringUtils.hasText(filter.getLocation())) {
                predicates.add(cb.like(
                        cb.lower(root.get("location")),
                        "%" + filter.getLocation().toLowerCase() + "%"
                ));
            }

            // ── SLA Breached ──────────────────────────────────────────────────
            if (filter.getSlaBreached() != null) {
                predicates.add(cb.equal(root.get("slaBreached"), filter.getSlaBreached()));
            }

            // ── Distinct (prevent duplicates on joins) ─────────────────────────
            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Filter for reopened tickets only.
     */
    public static Specification<Ticket> reopenedTickets() {
        return (root, query, cb) -> cb.or(
                cb.equal(root.get("status"), Ticket.TicketStatus.REOPENED),
                cb.greaterThan(root.get("reopenedCount"), 0)
        );
    }

    /**
     * Combine reopened filter with the general date/keyword filter.
     */
    public static Specification<Ticket> reopenedWithFilter(ReportFilterDTO filter) {
        return Specification.where(reopenedTickets()).and(ticketFilter(filter));
    }
}
