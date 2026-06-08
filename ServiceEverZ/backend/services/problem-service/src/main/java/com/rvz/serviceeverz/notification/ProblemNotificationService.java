package com.rvz.serviceeverz.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.rvz.serviceeverz.client.MailFeignClient;
import com.rvz.serviceeverz.client.MailFeignClient.MailRequest;
import com.rvz.serviceeverz.client.UserFeignClient;
import com.rvz.serviceeverz.entity.KnownErrorRecord;
import com.rvz.serviceeverz.entity.Problem;

@Service
public class ProblemNotificationService {

	private static final Logger log = LoggerFactory.getLogger(ProblemNotificationService.class);

	private final MailFeignClient mailClient;
	private final UserFeignClient userClient;

	public ProblemNotificationService(MailFeignClient mailClient, UserFeignClient userClient) {
		this.mailClient = mailClient;
		this.userClient = userClient;
	}

	private String resolveEmail(Long userId) {
		try {
			var resp = userClient.getUserEmail(userId);
			return (resp != null && resp.getData() != null) ? resp.getData() : null;
		} catch (Exception e) {
			log.warn("Could not resolve email for userId={}: {}", userId, e.getMessage());
			return null;
		}
	}

	private String resolveName(Long userId) {
		try {
			var resp = userClient.getUserName(userId);
			return (resp != null && resp.getData() != null) ? resp.getData() : "User #" + userId;
		} catch (Exception e) {
			return "User #" + userId;
		}
	}

	private void send(String to, String subject, String body) {
		if (to == null || to.isBlank()) {
			log.warn("Cannot send notification — email is null");
			return;
		}
		try {
			mailClient.sendMail(new MailRequest(to, subject, body, true));
			log.info("Notification sent to {}: {}", to, subject);
		} catch (Exception e) {
			log.error("Notification failed to {}: {}", to, e.getMessage());
		}
	}

	public void notifyManagerProblemCreated(Problem p) {
		String to = resolveEmail(p.getManagerId());
		String spName = resolveName(p.getCreatedBySpId());
		String subject = "[Problem Management] New Problem Created: " + p.getProblemNumber();
		String body = "<h3>New Problem Logged</h3>" + "<p><b>Problem #:</b> " + p.getProblemNumber() + "</p>"
				+ "<p><b>Title:</b> " + p.getTitle() + "</p>" + "<p><b>Priority:</b> " + p.getPriority() + "</p>"
				+ "<p><b>Impact:</b> " + p.getImpact() + "</p>" + "<p><b>CI:</b> "
				+ (p.getCiName() != null ? p.getCiName() : "N/A") + "</p>" + "<p><b>Created By:</b> " + spName + "</p>"
				+ "<p>The support team is currently investigating. You will be notified on updates.</p>";
		send(to, subject, body);
	}

	public void notifyManagerWorkaroundProvided(Problem p) {
		String to = resolveEmail(p.getManagerId());
		String spName = resolveName(p.getCreatedBySpId());
		String subject = "[Problem Management] Workaround Provided: " + p.getProblemNumber();
		String body = "<h3>Workaround / Short-Term Fix Applied</h3>" + "<p><b>Problem #:</b> " + p.getProblemNumber()
				+ "</p>" + "<p><b>Title:</b> " + p.getTitle() + "</p>" + "<p><b>Workaround:</b> " + p.getWorkaround()
				+ "</p>" + "<p><b>Applied By:</b> " + spName + "</p>"
				+ "<p>A permanent fix is still being investigated.</p>";
		send(to, subject, body);
	}

	public void notifyManagerPermanentFixFound(Problem p, KnownErrorRecord ker) {
		String to = resolveEmail(p.getManagerId());
		String spName = resolveName(p.getCreatedBySpId());
		String subject = "[Problem Management] Permanent Fix Found & KEDB Updated: " + p.getProblemNumber();
		String body = "<h3>Permanent Solution Found</h3>" + "<p><b>Problem #:</b> " + p.getProblemNumber() + "</p>"
				+ "<p><b>Title:</b> " + p.getTitle() + "</p>" + "<p><b>Root Cause:</b> " + p.getRootCause() + "</p>"
				+ "<p><b>Permanent Fix:</b> " + p.getPermanentFix() + "</p>" + "<p><b>KEDB Entry #:</b> "
				+ ker.getKerNumber() + "</p>" + "<p><b>Resolved By:</b> " + spName + "</p>"
				+ "<p>This solution has been recorded in the Known Error Database (KEDB).</p>";
		send(to, subject, body);
	}

	public void notifyManagerProblemClosed(Problem p) {
		String to = resolveEmail(p.getManagerId());
		String subject = "[Problem Management] Problem Closed: " + p.getProblemNumber();
		String body = "<h3>Problem Closed</h3>" + "<p><b>Problem #:</b> " + p.getProblemNumber() + "</p>"
				+ "<p><b>Title:</b> " + p.getTitle() + "</p>" + "<p><b>Closed At:</b> " + p.getClosedAt() + "</p>"
				+ "<p>This problem has been fully resolved and closed.</p>";
		send(to, subject, body);
	}
}
