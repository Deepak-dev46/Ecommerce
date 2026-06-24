package com.rvz.approvalservice.scheduler;
 
import com.rvz.approvalservice.client.MailClient;
import com.rvz.approvalservice.config.ApprovalConstants;
import com.rvz.approvalservice.dto.request.EmailRequest;
import com.rvz.approvalservice.entity.TicketApproval;
import com.rvz.approvalservice.repository.TicketApprovalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
 
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
 
@Component
public class ApprovalReminderScheduler {
 
    private static final Logger log = LoggerFactory.getLogger(ApprovalReminderScheduler.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");
 
    private final TicketApprovalRepository approvalRepository;
    private final MailClient mailClient;
 
    public ApprovalReminderScheduler(TicketApprovalRepository approvalRepository,
                                     MailClient mailClient) {
        this.approvalRepository = approvalRepository;
        this.mailClient = mailClient;
    }
 
    @Scheduled(cron = "0 0 * * * *")  // every hour
    public void sendApprovalReminders() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        List<TicketApproval> pending = approvalRepository.findStillPendingBefore(threshold);
 
        if (pending.isEmpty()) {
            log.info("[ApprovalReminder] No overdue approvals found.");
            return;
        }
 
        log.info("[ApprovalReminder] Found {} overdue approval(s).", pending.size());
 
        for (TicketApproval approval : pending) {
            try {
                sendRemindersForApproval(approval);
            } catch (Exception e) {
                log.error("[ApprovalReminder] Failed for ticketId={}: {}", approval.getTicketId(), e.getMessage());
            }
        }
    }
 
    private void sendRemindersForApproval(TicketApproval approval) {
        String ticketRef = approval.getTicketNumber() != null ? approval.getTicketNumber() : "Ticket #" + approval.getTicketId();
        String subject   = approval.getTicketSubject() != null ? approval.getTicketSubject() : "(No Subject)";
        String since     = approval.getUpdatedAt() != null ? approval.getUpdatedAt().format(FMT) : approval.getCreatedAt().format(FMT);
 
        if (ApprovalConstants.PENDING.equals(approval.getL1Status()) && approval.getL1ApproverEmail() != null) {
            sendReminderEmail(approval.getL1ApproverEmail(), approval.getL1ApproverName(), ticketRef, subject, since, "L1 Approver");
        }
 
        if (ApprovalConstants.APPROVED.equals(approval.getL1Status())
                && ApprovalConstants.PENDING.equals(approval.getL2Status())
                && approval.getL2ApproverEmail() != null) {
            sendReminderEmail(approval.getL2ApproverEmail(), approval.getL2ApproverName(), ticketRef, subject, since, "L2 Approver");
        }
 
        if (ApprovalConstants.APPROVED.equals(approval.getL1Status())
                && ApprovalConstants.APPROVED.equals(approval.getL2Status())
                && Boolean.TRUE.equals(approval.getRequiresResourceApproval())
                && ApprovalConstants.PENDING.equals(approval.getResourceOwnerStatus())
                && approval.getResourceOwnerEmail() != null) {
            sendReminderEmail(approval.getResourceOwnerEmail(), approval.getResourceOwnerName(), ticketRef, subject, since, "Resource Owner");
        }
    }
 
    private void sendReminderEmail(String toEmail, String toName, String ticketRef,
                                   String ticketSubject, String pendingSince, String role) {
        String body = "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<p>Dear " + (toName != null ? toName : "Approver") + ",</p>"
                + "<p>This is a reminder that the following ticket is awaiting your approval as <strong>"
                + role + "</strong> and has been pending for more than 24 hours.</p>"
                + "<table style='border-collapse:collapse;width:100%;max-width:500px'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd;background:#f5f5f5'><strong>Ticket</strong></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + ticketRef + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd;background:#f5f5f5'><strong>Subject</strong></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + ticketSubject + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd;background:#f5f5f5'><strong>Pending Since</strong></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + pendingSince + "</td></tr>"
                + "</table>"
                + "<p>Please log in to <strong>ServiceEverz</strong> and take action at your earliest convenience.</p>"
                + "<p style='color:#888;font-size:12px'>This is an automated reminder. Do not reply to this email.</p>"
                + "</body></html>";
 
        mailClient.sendEmail(new EmailRequest(toEmail, "[Action Required] Approval Pending for " + ticketRef, body, true));
        log.info("[ApprovalReminder] Reminder sent to {} ({}) for {}", toEmail, role, ticketRef);
    }
}