package com.rvz.serviceeverz.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.rvz.serviceeverz.dto.request.BulkMailRequest;
import com.rvz.serviceeverz.dto.request.MailRequest;
import com.rvz.serviceeverz.entity.ChangePlan;
import com.rvz.serviceeverz.entity.FreezeWindow;
import com.rvz.serviceeverz.feign.MailServiceClient;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Owns all email composition and dispatch logic.
 *
 * TWO dispatch modes:
 *   dispatch()      → POST /api/mail/send       — 1 recipient, 1 Feign call
 *   dispatchBulk()  → POST /api/mail/send-bulk  — N recipients, 1 Feign call, 1 SMTP connection
 *
 * Rule:
 *   Targeted emails (SP/Manager)    → dispatch()
 *   Broadcast emails (all users)    → dispatchBulk()
 */
@Service
public class EmailComposerService {

    private static final Logger log = LoggerFactory.getLogger(EmailComposerService.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a");

    private final MailServiceClient mailServiceClient;

    public EmailComposerService(MailServiceClient mailServiceClient) {
        this.mailServiceClient = mailServiceClient;
    }

    // ── 1. SP submits → notify ITSM Manager (targeted, 1 call) ───────────────
    public void sendChangeRequestToManager(String managerEmail, String managerName,
                                           ChangePlan plan, String spName) {
        String subject = "[Change Request] " + plan.getChangeNumber() + " — Awaiting Your Approval";
        String body = wrap(
            "<h2 style='color:#2c3e50;'>📋 New Change Request Submitted</h2>"
            + "<p>Dear <b>" + managerName + "</b>,</p>"
            + "<p>Support Personnel <b>" + spName + "</b> has submitted a change request requiring your approval.</p>"
            + summaryTable(plan)
            + "<p>Please log in to the <b>ServiceEverZ ITSM Portal</b> to review and take action.</p>");
        dispatch(managerEmail, subject, body);
    }

    // ── 2. Manager approves → notify SP (targeted, 1 call) ───────────────────
    public void sendApprovalNotificationToSp(String spEmail, String spName, ChangePlan plan) {
        String subject = "✅ [Approved] Change Request " + plan.getChangeNumber();
        String body = wrap(
            "<h2 style='color:#27ae60;'>✅ Change Request Approved</h2>"
            + "<p>Dear <b>" + spName + "</b>,</p>"
            + "<p>Your request <b>" + plan.getChangeNumber() + "</b> has been "
            + "<b style='color:#27ae60;'>APPROVED</b>.</p>"
            + summaryTable(plan)
            + "<p><b>Manager's Comment:</b> "
            + (plan.getManagerComment() != null ? plan.getManagerComment() : "No additional comments")
            + "</p><p>You may proceed with implementation as per the planned schedule.</p>");
        dispatch(spEmail, subject, body);
    }

    // ── 3. Manager rejects → notify SP (targeted, 1 call) ────────────────────
    public void sendRejectionNotificationToSp(String spEmail, String spName, ChangePlan plan) {
        String subject = "❌ [Rejected] Change Request " + plan.getChangeNumber();
        String body = wrap(
            "<h2 style='color:#e74c3c;'>❌ Change Request Rejected</h2>"
            + "<p>Dear <b>" + spName + "</b>,</p>"
            + "<p>Your request <b>" + plan.getChangeNumber() + "</b> has been "
            + "<b style='color:#e74c3c;'>REJECTED</b>.</p>"
            + summaryTable(plan)
            + "<p><b>Reason:</b> "
            + (plan.getManagerComment() != null ? plan.getManagerComment() : "No reason provided")
            + "</p><p>Please review the feedback and raise a new change request if required.</p>");
        dispatch(spEmail, subject, body);
    }

    // ── 4. Manager requests revision → notify SP (targeted, 1 call) ──────────
    public void sendRevisionRequestedToSp(String spEmail, String spName, ChangePlan plan) {
        String subject = "🔄 [Action Required] Revision Requested — " + plan.getChangeNumber();
        String body = wrap(
            "<h2 style='color:#e67e22;'>🔄 Revision Requested</h2>"
            + "<p>Dear <b>" + spName + "</b>,</p>"
            + "<p>The ITSM Manager has requested revisions on <b>" + plan.getChangeNumber() + "</b>.</p>"
            + summaryTable(plan)
            + "<div style='background:#fff8e1;border-left:4px solid #e67e22;padding:12px;margin:12px 0;'>"
            + "<b>Manager's Instructions:</b><br/>"
            + (plan.getManagerComment() != null ? plan.getManagerComment() : "Update as per manager guidance.")
            + "</div>"
            + "<p>Please log in, update the plan and resubmit for approval.</p>");
        dispatch(spEmail, subject, body);
    }

    // ── 5. Change approved → BULK broadcast maintenance window to ALL users ───
    //      1 Feign call to mail-service → 1 SMTP connection for all recipients
    public void sendMaintenanceNotificationToAllUsers(List<String> allEmails, ChangePlan plan) {
        String subject = "⚠️ [Maintenance Notice] Scheduled System Change — " + plan.getChangeNumber();
        String body = wrap(
            "<h2 style='color:#e67e22;'>⚠️ Scheduled System Maintenance</h2>"
            + "<p>Dear User,</p>"
            + "<p>A system change has been approved and is scheduled. "
            + "The system will be temporarily <b>unavailable</b> during the window below.</p>"
            + "<table border='1' cellpadding='10' cellspacing='0' style='border-collapse:collapse;width:100%;margin:12px 0;'>"
            + "<tr style='background:#f2f2f2;'><th>Detail</th><th>Information</th></tr>"
            + "<tr><td><b>Change Number</b></td><td>" + plan.getChangeNumber() + "</td></tr>"
            + "<tr><td><b>Title</b></td><td>" + plan.getTitle() + "</td></tr>"
            + "<tr><td><b>Type</b></td><td>" + plan.getChangeType() + "</td></tr>"
            + "<tr><td><b>Priority</b></td><td>" + plan.getPriority() + "</td></tr>"
            + "<tr><td><b>⬇️ Downtime Start</b></td><td><b style='color:#e74c3c;'>"
            + plan.getPlannedStartTime().format(FMT) + "</b></td></tr>"
            + "<tr><td><b>⬆️ Downtime End</b></td><td><b style='color:#27ae60;'>"
            + plan.getPlannedEndTime().format(FMT) + "</b></td></tr>"
            + "</table>"
            + "<p>Please <b>save your work</b> before the maintenance window begins.</p>");
        dispatchBulk(allEmails, subject, body);
    }

    // ── 6. Freeze window created → BULK broadcast to ALL users ────────────────
    //      1 Feign call to mail-service → 1 SMTP connection for all recipients
    public void sendFreezeWindowNotification(List<String> allEmails, FreezeWindow fw) {
        String subject = "🚫 [Freeze Window Alert] No Changes Permitted: "
                + fw.getFreezeStart().format(FMT) + " → " + fw.getFreezeEnd().format(FMT);
        String body = wrap(
            "<h2 style='color:#c0392b;'>🚫 Change Freeze Window Declared</h2>"
            + "<p>Dear User,</p>"
            + "<p>A <b>Change Freeze Window</b> has been declared. "
            + "No system changes will be permitted during this period.</p>"
            + "<table border='1' cellpadding='10' cellspacing='0' style='border-collapse:collapse;width:100%;margin:12px 0;'>"
            + "<tr style='background:#f2f2f2;'><th>Detail</th><th>Information</th></tr>"
            + "<tr><td><b>Freeze Start</b></td><td><b style='color:#e74c3c;'>"
            + fw.getFreezeStart().format(FMT) + "</b></td></tr>"
            + "<tr><td><b>Freeze End</b></td><td><b style='color:#27ae60;'>"
            + fw.getFreezeEnd().format(FMT) + "</b></td></tr>"
            + "<tr><td><b>Reason</b></td><td>" + fw.getReason() + "</td></tr>"
            + "</table>"
            + "<p>No change requests will be processed during this period. Plan accordingly.</p>");
        dispatchBulk(allEmails, subject, body);
    }

    // ── PRIVATE: single email → POST /api/mail/send ───────────────────────────
    private void dispatch(String to, String subject, String htmlBody) {
        try {
            mailServiceClient.sendMail(new MailRequest(to, subject, htmlBody, true));
            log.info("Email dispatched → to={}, subject={}", to, subject);
        } catch (Exception ex) {
            log.error("Email dispatch failed to={}: {}", to, ex.getMessage());
        }
    }

    // ── PRIVATE: bulk email → POST /api/mail/send-bulk ────────────────────────
    //   Always 1 HTTP call regardless of how many users exist
    private void dispatchBulk(List<String> recipients, String subject, String htmlBody) {
        try {
            mailServiceClient.sendBulkMail(new BulkMailRequest(recipients, subject, htmlBody, true));
            log.info("Bulk email dispatched → recipients={}, subject={}", recipients.size(), subject);
        } catch (Exception ex) {
            log.error("Bulk email dispatch failed subject={}: {}", subject, ex.getMessage());
        }
    }

    // ── PRIVATE helpers ───────────────────────────────────────────────────────
    private String summaryTable(ChangePlan plan) {
        return "<table border='1' cellpadding='10' cellspacing='0' style='border-collapse:collapse;width:100%;margin:12px 0;'>"
            + "<tr style='background:#f2f2f2;'><th>Field</th><th>Details</th></tr>"
            + "<tr><td><b>Change Number</b></td><td>" + plan.getChangeNumber() + "</td></tr>"
            + "<tr><td><b>Title</b></td><td>" + plan.getTitle() + "</td></tr>"
            + "<tr><td><b>Type</b></td><td>" + plan.getChangeType() + "</td></tr>"
            + "<tr><td><b>Priority</b></td><td>" + plan.getPriority() + "</td></tr>"
            + "<tr><td><b>Status</b></td><td>" + plan.getStatus() + "</td></tr>"
            + "<tr><td><b>Planned Start</b></td><td>" + plan.getPlannedStartTime().format(FMT) + "</td></tr>"
            + "<tr><td><b>Planned End</b></td><td>" + plan.getPlannedEndTime().format(FMT) + "</td></tr>"
            + "</table>";
    }

    private String wrap(String content) {
        return "<div style='font-family:Arial,sans-serif;max-width:700px;'>"
            + content
            + "<hr/><p style='color:#7f8c8d;font-size:12px;'>"
            + "Automated notification from <b>ServiceEverZ ITSM</b>. Do not reply.</p></div>";
    }
}
