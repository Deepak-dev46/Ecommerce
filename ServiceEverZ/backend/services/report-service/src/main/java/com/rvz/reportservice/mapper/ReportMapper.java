package com.rvz.reportservice.mapper;

import com.rvz.reportservice.entity.*;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Converts entities into generic {@code Map<String, Object>} row maps
 * consumed by {@link com.itsm.reports.dto.ReportDTO#getRows()} and the CSV
 * generator.  Each method is intentionally simple — the caller decides
 * which fields to include by choosing the right mapper method.
 */
@Component
public class ReportMapper {

    // ── Ticket ────────────────────────────────────────────────────────────────

    public Map<String, Object> ticketToRow(Ticket t) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("ticketId",               t.getTicketId());
        row.put("ticketNumber",           t.getTicketNumber());
        row.put("subject",                t.getSubject());
        row.put("status",                 t.getStatus() != null ? t.getStatus().name() : null);
        row.put("priority",               t.getPriority() != null ? t.getPriority().name() : null);
        row.put("typeName",               t.getTypeName());
        row.put("categoryName",           t.getCategoryName());
        row.put("subCategoryName",        t.getSubCategoryName());
        row.put("requesterName",          t.getRequesterName());
        row.put("assigneeName",           t.getAssigneeName());
        row.put("slaBreached",            t.getSlaBreached());
        row.put("reopenedCount",          t.getReopenedCount());
        row.put("responseTimeMinutes",    t.getResponseTimeMinutes());
        row.put("resolutionTimeMinutes",  t.getResolutionTimeMinutes());
        row.put("createdAt",              t.getCreatedAt());
        row.put("updatedAt",              t.getUpdatedAt());
        return row;
    }

    // ── SLA ───────────────────────────────────────────────────────────────────

    public Map<String, Object> slaToRow(SLA s) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("slaId",                  s.getSlaId());
        row.put("ticketId",               s.getTicketId());
        row.put("ticketNumber",           s.getTicketNumber());
        row.put("priority",               s.getPriority());
        row.put("status",                 s.getStatus());
        row.put("startedAt",              s.getStartedAt());
        row.put("dueAt",                  s.getDueAt());
        row.put("completedAt",            s.getCompletedAt());
        row.put("breached",               s.getBreached());
        row.put("responseTimeMinutes",    s.getResponseTimeMinutes());
        row.put("resolutionTimeMinutes",  s.getResolutionTimeMinutes());
        row.put("responseSLAMet",         s.getResponseSLAMet());
        row.put("resolutionSLAMet",       s.getResolutionSLAMet());
        row.put("assigneeName",           s.getAssigneeName());
        row.put("categoryName",           s.getCategoryName());
        return row;
    }

    // ── Feedback (CSAT) ───────────────────────────────────────────────────────

    public Map<String, Object> feedbackToRow(Feedback f) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("surveyId",       f.getSurveyId());
        row.put("ticketId",       f.getTicketId());
        row.put("ticketNumber",   f.getTicketNumber());
        row.put("requesterName",  f.getAnonymous() ? "Anonymous" : f.getRequesterName());
        row.put("resolvedByName", f.getResolvedByName());
        row.put("categoryName",   f.getCategoryName());
        row.put("rating",         f.getRating());
        row.put("comments",       f.getAnonymous() ? null : f.getComments());
        row.put("submittedAt",    f.getSubmittedAt());
        return row;
    }

    // ── Audit ─────────────────────────────────────────────────────────────────

    public Map<String, Object> auditToRow(Audit a) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("auditId",          a.getAuditId());
        row.put("action",           a.getAction());
        row.put("entityType",       a.getEntityType());
        row.put("entityId",         a.getEntityId());
        row.put("entityReference",  a.getEntityReference());
        row.put("performedBy",      a.getPerformedBy());
        row.put("performedByRole",  a.getPerformedByRole());
        row.put("oldValue",         a.getOldValue());
        row.put("newValue",         a.getNewValue());
        row.put("details",          a.getDetails());
        row.put("module",           a.getModule());
        row.put("ipAddress",        a.getIpAddress());
        row.put("success",          a.getSuccess());
        row.put("createdAt",        a.getCreatedAt());
        return row;
    }

    // ── Incident ──────────────────────────────────────────────────────────────

    public Map<String, Object> incidentToRow(Incident i) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("incidentId",      i.getIncidentId());
        row.put("ticketNumber",    i.getTicketNumber());
        row.put("subject",         i.getSubject());
        row.put("status",          i.getStatus());
        row.put("priority",        i.getPriority());
        row.put("categoryName",    i.getCategoryName());
        row.put("requesterName",   i.getRequesterName());
        row.put("assignedToName",  i.getAssignedToName());
        row.put("source",          i.getSource());
        row.put("occurredAt",      i.getOccurredAt());
        row.put("resolvedAt",      i.getResolvedAt());
        row.put("createdAt",       i.getCreatedAt());
        return row;
    }

    // ── Approval ──────────────────────────────────────────────────────────────

    public Map<String, Object> approvalToRow(Approval a) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("approvalId",         a.getApprovalId());
        row.put("ticketId",           a.getTicketId());
        row.put("ticketNumber",       a.getTicketNumber());
        row.put("overallStatus",      a.getOverallStatus());
        row.put("l1ApproverName",     a.getL1ApproverName());
        row.put("l1Status",           a.getL1Status());
        row.put("l1ActionedAt",       a.getL1ActionedAt());
        row.put("l2ApproverName",     a.getL2ApproverName());
        row.put("l2Status",           a.getL2Status());
        row.put("l2ActionedAt",       a.getL2ActionedAt());
        row.put("resourceOwnerName",  a.getResourceOwnerName());
        row.put("resourceOwnerStatus",a.getResourceOwnerStatus());
        row.put("createdAt",          a.getCreatedAt());
        return row;
    }


    // ── Project ───────────────────────────────────────────────────────────────

    public Map<String, Object> projectToRow(Project p) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("projectId",    p.getProjectId());
        row.put("projectName",  p.getProjectName());
        row.put("projectCode",  p.getProjectCode());
        row.put("description",  p.getDescription());
        row.put("ownerName",    p.getOwnerName());
        row.put("status",       p.getStatus());
        row.put("startDate",    p.getStartDate());
        row.put("endDate",      p.getEndDate());
        row.put("createdAt",    p.getCreatedAt());
        return row;
    }

    // ── User ──────────────────────────────────────────────────────────────────

    public Map<String, Object> userToRow(User u) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id",           u.getId());
        row.put("employeeId",   u.getEmployeeId());
        row.put("firstName",    u.getFirstName());
        row.put("lastName",     u.getLastName());
        row.put("email",        u.getEmail());
        row.put("department",   u.getDepartment());
        row.put("designation",  u.getDesignation());
        row.put("location",     u.getLocation());
        row.put("role",         u.getRole());
        row.put("status",       u.getStatus());
        row.put("createdAt",    u.getCreatedAt());
        return row;
    }

    // ── KnowledgeBase ─────────────────────────────────────────────────────────

    public Map<String, Object> kbToRow(KnowledgeBase kb) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("kbId",           kb.getKbId());
        row.put("title",          kb.getTitle());
        row.put("category",       kb.getCategory());
        row.put("subCategory",    kb.getSubCategory());
        row.put("status",         kb.getStatus());
        row.put("authorName",     kb.getAuthorName());
        row.put("reviewerName",   kb.getReviewerName());
        row.put("viewCount",      kb.getViewCount());
        row.put("helpfulCount",   kb.getHelpfulCount());
        row.put("notHelpfulCount",kb.getNotHelpfulCount());
        row.put("publishedAt",    kb.getPublishedAt());
        row.put("createdAt",      kb.getCreatedAt());
        return row;
    }
}
