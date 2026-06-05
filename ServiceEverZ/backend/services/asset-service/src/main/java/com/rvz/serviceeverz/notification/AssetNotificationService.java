package com.rvz.serviceeverz.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.rvz.serviceeverz.dto.response.UserSummaryResponse;
import com.rvz.serviceeverz.entity.Asset;
import com.rvz.serviceeverz.entity.AssetMapping;
import com.rvz.serviceeverz.entity.AssetNotificationLog;
import com.rvz.serviceeverz.entity.BackupSchedule;
import com.rvz.serviceeverz.enums.NotificationType;
import com.rvz.serviceeverz.feign.MailServiceClient;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.repository.AssetNotificationLogRepository;

@Service
public class AssetNotificationService {

	private static final Logger log = LoggerFactory.getLogger(AssetNotificationService.class);

	private final MailServiceClient mailClient;
	private final UserServiceClient userClient;
	private final AssetNotificationLogRepository logRepo;

	@Value("${notification.manager.user-id}")
	private Long configManagerUserId;

	public AssetNotificationService(MailServiceClient mailClient, UserServiceClient userClient,
			AssetNotificationLogRepository logRepo) {
		this.mailClient = mailClient;
		this.userClient = userClient;
		this.logRepo = logRepo;
	}

	private UserSummaryResponse fetchUser(Long userId) {
		if (userId == null) return null;
		try {
			return userClient.getUserById(userId);
		} catch (Exception e) {
			log.error("Failed to fetch user {} from user-service: {}", userId, e.getMessage());
			return null;
		}
	}

	private String resolveEmail(Long userId) {
		if (userId == null) return null;
		UserSummaryResponse user = fetchUser(userId);
		if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
			return user.getEmail();
		}
		log.warn("Email not found in UMS for userId={}", userId);
		return null;
	}

	private String resolveName(Long userId) {
		if (userId == null) return "Team Member";
		UserSummaryResponse user = fetchUser(userId);
		if (user != null && user.getFullName() != null && !user.getFullName().isBlank()) {
			return user.getFullName();
		}
		return "Team Member";
	}

	@Async("notificationExecutor")
	public void send(Long mappingId, NotificationType type, Long recipientId, String subject, String body) {
		String to = resolveEmail(recipientId);

		AssetNotificationLog entry = new AssetNotificationLog();
		entry.setMappingId(mappingId);
		entry.setNotificationType(type);
		entry.setRecipientUserId(recipientId);
		entry.setRecipientEmail(to);
		entry.setSubject(subject);
		entry.setBody(body);

		if (to == null || to.isBlank()) {
			log.error("Cannot send [{}] — email not resolved for userId={}", type, recipientId);
			entry.setIsSent(false);
			entry.setErrorMessage("Recipient email could not be resolved from UMS for userId=" + recipientId);
			logRepo.save(entry);
			return;
		}

		try {
			mailClient.sendMail(new MailServiceClient.MailRequest(to, subject, body, true));
			entry.setIsSent(true);
			log.info("Notification sent [{}] -> {}", type, to);
		} catch (Exception e) {
			entry.setIsSent(false);
			entry.setErrorMessage(e.getMessage());
			log.error("Notification failed [{}] -> {}: {}", type, to, e.getMessage());
		}

		logRepo.save(entry);
	}

	// ── Asset Mapping Notifications ───────────────────────────────────────────

	public void notifySpMappingRequestReceived(AssetMapping m) {
		send(m.getId(), NotificationType.MAPPING_REQUEST_RECEIVED_BY_SP, m.getAssignedBySpId(),
				"[Asset Request] New assignment — " + m.getMappingNumber(),
				buildHtml("New Asset Assignment Request", "A new asset assignment request requires your review.",
						row("Mapping No.", m.getMappingNumber()),
						row("Asset", m.getAsset().getName() + " [" + m.getAsset().getOwnershipType() + "]"),
						row("Requested By", resolveName(m.getRequestedByUserId())),
						row("Ticket ID", str(m.getTicketId()))));
	}

	public void notifyUserAdditionalDetailsRequiredBySp(AssetMapping m) {
		send(m.getId(), NotificationType.SP_REQUESTS_ADDITIONAL_DETAILS, m.getRequestedByUserId(),
				"[Asset Request] Additional details required — " + m.getMappingNumber(),
				buildHtml("Additional Information Required",
						resolveName(m.getAssignedBySpId()) + " needs more information to process your request.",
						row("Mapping No.", m.getMappingNumber()), row("Asset", m.getAsset().getName()),
						row("Details Required", orDash(m.getAdditionalDetailsRequest()))));
	}

	public void notifyManagerApprovalRequired(AssetMapping m) {
		send(m.getId(), NotificationType.SP_APPROVED_SENT_TO_MANAGER, configManagerUserId,
				"[Asset Approval] Awaiting your approval — " + m.getMappingNumber(),
				buildHtml("Asset Assignment Awaiting Final Approval",
						resolveName(m.getAssignedBySpId()) + " has forwarded this request for your approval.",
						row("Mapping No.", m.getMappingNumber()),
						row("Asset", m.getAsset().getName() + " [" + m.getAsset().getOwnershipType() + "]"),
						row("Requested By", resolveName(m.getRequestedByUserId())),
						row("SP Remarks", orDash(m.getSpRemarks()))));
	}

	public void notifySpManagerRequestsAdditionalDetails(AssetMapping m) {
		send(m.getId(), NotificationType.MANAGER_REQUESTS_ADDITIONAL_DETAILS, m.getAssignedBySpId(),
				"[Asset Approval] Manager requests details — " + m.getMappingNumber(),
				buildHtml("Manager Requests Additional Details",
						"The ITSM Manager needs more information before approving.",
						row("Mapping No.", m.getMappingNumber()),
						row("Details Requested", orDash(m.getAdditionalDetailsRequest()))));
	}

	public void notifySpManagerApproved(AssetMapping m) {
		send(m.getId(), NotificationType.MANAGER_APPROVED_NOTIFY_SP, m.getAssignedBySpId(),
				"[Asset Approved] Manager approved — " + m.getMappingNumber(),
				buildHtml("Asset Assignment Approved by Manager", "The ITSM Manager has approved the asset assignment.",
						row("Mapping No.", m.getMappingNumber()), row("Asset", m.getAsset().getName()),
						row("Manager Remarks", orDash(m.getManagerRemarks()))));
	}

	public void notifyUserAssetApproved(AssetMapping m) {
		send(m.getId(), NotificationType.MANAGER_APPROVED_NOTIFY_USER, m.getRequestedByUserId(),
				"[Asset Assigned] Your request is approved — " + m.getMappingNumber(),
				buildHtml("Your Asset Has Been Assigned",
						"Your asset request has been fully approved and assigned to you.",
						row("Mapping No.", m.getMappingNumber()),
						row("Asset", m.getAsset().getName() + " (" + m.getAsset().getAssetTag() + ")"),
						row("Assigned By", resolveName(m.getAssignedBySpId())),
						row("Ticket ID", str(m.getTicketId()))));
	}

	public void notifySpManagerRejected(AssetMapping m) {
		send(m.getId(), NotificationType.MANAGER_REJECTED_NOTIFY_SP, m.getAssignedBySpId(),
				"[Asset Rejected] Manager rejected — " + m.getMappingNumber(),
				buildHtml("Asset Assignment Rejected by Manager", "The ITSM Manager has rejected this asset mapping.",
						row("Mapping No.", m.getMappingNumber()), row("Reason", orDash(m.getManagerRemarks()))));
	}

	public void notifyUserAssetRejectedByManager(AssetMapping m) {
		send(m.getId(), NotificationType.MANAGER_REJECTED_NOTIFY_USER, m.getRequestedByUserId(),
				"[Asset Request] Request could not be approved — " + m.getMappingNumber(),
				buildHtml("Asset Request Rejected", "Your asset request could not be approved at this time.",
						row("Asset", m.getAsset().getName()), row("Reason", orDash(m.getManagerRemarks()))));
	}

	public void notifyUserAssetRejectedBySp(AssetMapping m) {
		send(m.getId(), NotificationType.SP_REJECTED_NOTIFY_USER, m.getRequestedByUserId(),
				"[Asset Request] Request declined — " + m.getMappingNumber(),
				buildHtml("Asset Request Declined",
						resolveName(m.getAssignedBySpId()) + " has declined your asset request.",
						row("Asset", m.getAsset().getName()), row("Reason", orDash(m.getSpRemarks()))));
	}

	public void notifyRentalExpiryWarning(Asset asset, Long managerUserId, int daysLeft) {
		send(null, NotificationType.RENTAL_EXPIRY_WARNING, managerUserId,
				"[Rental Alert] Contract expiring in " + daysLeft + " days — " + asset.getAssetTag(),
				buildHtml("Rental Contract Expiry Warning",
						"A rental asset contract is about to expire. Please take action.",
						row("Asset", asset.getName() + " (" + asset.getAssetTag() + ")"),
						row("Vendor", orDash(asset.getRentalVendorName())),
						row("Contract No.", orDash(asset.getRentalContractNumber())),
						row("End Date", asset.getRentalEndDate() != null ? asset.getRentalEndDate().toString() : "—"),
						row("Days Left", String.valueOf(daysLeft)),
						row("Renewal Option",
								asset.getRentalRenewalOption() != null ? (asset.getRentalRenewalOption() ? "Yes" : "No")
										: "—")));
	}

	// ── Backup Schedule Notifications ─────────────────────────────────────────

	/**
	 * Sent to the SP who created the schedule when a new backup schedule is saved.
	 */
	public void notifyBackupScheduled(BackupSchedule schedule, String spName, String assetName,
			String policyName) {
		send(null, NotificationType.BACKUP_SCHEDULED, schedule.getCreatedBySpId(),
				"[Backup Scheduled] " + schedule.getScheduleName(),
				buildHtml("Backup Schedule Created",
						"A new backup schedule has been successfully created.",
						row("Schedule Name", schedule.getScheduleName()),
						row("Description", orDash(schedule.getDescription())),
						row("Asset", orDash(assetName)),
						row("Retention Policy", orDash(policyName)),
						row("Frequency", schedule.getFrequency() != null ? schedule.getFrequency().name() : "—"),
						row("Scheduled Date", schedule.getScheduledDate() != null ? schedule.getScheduledDate().toString() : "—"),
						row("Created By", orDash(spName))));
	}

	/**
	 * Sent to the SP when backup status changes to BACKUP_INITIATED.
	 */
	public void notifyBackupInitiated(BackupSchedule schedule, String spName, String assetName) {
		send(null, NotificationType.BACKUP_INITIATED, schedule.getCreatedBySpId(),
				"[Backup Initiated] " + schedule.getScheduleName(),
				buildHtml("Backup Has Been Initiated",
						"The backup process has started for the scheduled backup.",
						row("Schedule Name", schedule.getScheduleName()),
						row("Asset", orDash(assetName)),
						row("Scheduled Date", schedule.getScheduledDate() != null ? schedule.getScheduledDate().toString() : "—"),
						row("Next Backup Date", schedule.getNextBackupDate() != null ? schedule.getNextBackupDate().toString() : "—"),
						row("Created By", orDash(spName))));
	}

	/**
	 * Sent to the SP when backup status changes to BACKUP_COMPLETED.
	 */
	public void notifyBackupCompleted(BackupSchedule schedule, String spName, String assetName,
			String policyName) {
		send(null, NotificationType.BACKUP_COMPLETED, schedule.getCreatedBySpId(),
				"[Backup Completed] " + schedule.getScheduleName(),
				buildHtml("Backup Completed Successfully",
						"The backup has been completed. The next backup date has been updated.",
						row("Schedule Name", schedule.getScheduleName()),
						row("Asset", orDash(assetName)),
						row("Retention Policy", orDash(policyName)),
						row("Frequency", schedule.getFrequency() != null ? schedule.getFrequency().name() : "—"),
						row("Next Backup Date", schedule.getNextBackupDate() != null ? schedule.getNextBackupDate().toString() : "—"),
						row("Created By", orDash(spName))));
	}

	/**
	 * Sent to the SP when a backup's next date is within 10 days.
	 */
	public void notifyBackupUpcomingReminder(BackupSchedule schedule, String spName, String assetName,
			int daysUntilBackup) {
		send(null, NotificationType.BACKUP_UPCOMING_REMINDER, schedule.getCreatedBySpId(),
				"[Backup Reminder] Upcoming backup in " + daysUntilBackup + " days — " + schedule.getScheduleName(),
				buildHtml("Upcoming Backup Reminder",
						"A scheduled backup is approaching. Please ensure all systems are ready.",
						row("Schedule Name", schedule.getScheduleName()),
						row("Asset", orDash(assetName)),
						row("Next Backup Date", schedule.getNextBackupDate() != null ? schedule.getNextBackupDate().toString() : "—"),
						row("Days Until Backup", String.valueOf(daysUntilBackup)),
						row("Frequency", schedule.getFrequency() != null ? schedule.getFrequency().name() : "—"),
						row("Created By", orDash(spName))));
	}

	// ── HTML Helpers ──────────────────────────────────────────────────────────

	private String buildHtml(String title, String intro, String... rows) {
		StringBuilder sb = new StringBuilder();
		sb.append("<html><body style=\"font-family:Arial,sans-serif;background:#f3f2f8;padding:24px;\">");
		sb.append("<div style=\"background:#fff;border-radius:10px;padding:28px;max-width:560px;margin:auto;\">");
		sb.append("<h2 style=\"color:#27235c;border-bottom:3px solid #97247e;padding-bottom:10px;\">").append(title)
				.append("</h2>");
		sb.append("<p style=\"color:#374151;font-size:14px;\">").append(intro).append("</p>");
		sb.append("<table style=\"width:100%;border-collapse:collapse;\">");
		for (String r : rows) {
			sb.append(r);
		}
		sb.append("</table>");
		sb.append("<p style=\"color:#9ca3af;font-size:11px;margin-top:20px;\">")
				.append("This is an automated notification from ServiceEverz ITSM. Please do not reply.")
				.append("</p>");
		sb.append("</div></body></html>");
		return sb.toString();
	}

	private String row(String label, String value) {
		return "<tr>" + "<td style=\"padding:8px;background:#f5e6f2;color:#97247e;font-weight:bold;width:40%;\">"
				+ label + "</td>" + "<td style=\"padding:8px;background:#fafafa;color:#111827;\">" + value + "</td>"
				+ "</tr>";
	}

	private String orDash(String v) {
		return (v != null && !v.isBlank()) ? v : "—";
	}

	private String str(Object v) {
		return v != null ? v.toString() : "—";
	}
}
