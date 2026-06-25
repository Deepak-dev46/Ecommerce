package com.rvz.emailticketservice.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.rvz.emailticketservice.client.AssetServiceClient;
import com.rvz.emailticketservice.client.RmoServiceClient;
import com.rvz.emailticketservice.client.TicketServiceClient;
import com.rvz.emailticketservice.client.UserServiceClient;
import com.rvz.emailticketservice.config.ImapProperties;
import com.rvz.emailticketservice.dto.ParsedEmail;
import com.rvz.emailticketservice.entity.InboundEmailLog;
import com.rvz.emailticketservice.exception.UserNotFoundException;
import com.rvz.emailticketservice.parser.EmailParser;
import com.rvz.emailticketservice.repository.InboundEmailLogRepository;

import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;

@Service
public class EmailTicketServiceImpl {

	private static final Logger log = LoggerFactory.getLogger(EmailTicketServiceImpl.class);

	private final ImapProperties imapProperties;
	private final EmailParser emailParser;
	private final InboundEmailLogRepository logRepo;
	private final UserServiceClient userClient;
	private final RmoServiceClient rmoClient;

	// Subject format
	private static final String SUBJECT_SEP = "|";

//    public EmailTicketServiceImpl(ImapProperties imapProperties,
//                                  EmailParser emailParser,
//                                  InboundEmailLogRepository logRepo,
//                                  UserServiceClient userClient,
//                                  RmoServiceClient rmoClient,
//                                  TicketServiceClient ticketClient,
//                                  JavaMailSender mailSender) {
//        this.imapProperties = imapProperties;
//        this.emailParser    = emailParser;
//        this.logRepo        = logRepo;
//        this.userClient     = userClient;
//        this.rmoClient      = rmoClient;
//        this.ticketClient   = ticketClient;
//        this.mailSender     = mailSender;
//    }

	private final TicketServiceClient ticketClient;
	private final AssetServiceClient assetClient;
	private final JavaMailSender mailSender;

	public EmailTicketServiceImpl(ImapProperties imapProperties, EmailParser emailParser,
			InboundEmailLogRepository logRepo, UserServiceClient userClient, RmoServiceClient rmoClient,
			TicketServiceClient ticketClient, AssetServiceClient assetClient, JavaMailSender mailSender) {
		this.imapProperties = imapProperties;
		this.emailParser = emailParser;
		this.logRepo = logRepo;
		this.userClient = userClient;
		this.rmoClient = rmoClient;
		this.ticketClient = ticketClient;
		this.assetClient = assetClient;
		this.mailSender = mailSender;
	}

	// =========================================================
	// PROCESS ONE EMAIL
	// =========================================================
	public void processEmail(ParsedEmail email) {

		// 1. Deduplication
		if (email.getMessageId() != null && logRepo.existsByMessageId(email.getMessageId())) {
			log.info("Duplicate email skipped: {}", email.getMessageId());
			return;
		}

		InboundEmailLog audit = newLog(email);
		logRepo.save(audit);

		try {
			// 2. Lookup sender in user-service
			Map<String, Object> userData = fetchUserByEmail(email.getFromAddress());
			Long userId = toLong(userData.get("id"));
			String firstName = str(userData.get("firstName"));
			String lastName = str(userData.get("lastName"));
			String fullName = buildFullName(firstName, lastName);
			String userEmail = str(userData.get("email"));

			// 3. Enrich from rmo-service (fullName, employeeId)
			Long masterEmpId = null;
			if (userId != null) {
				try {
					Map<String, Object> rmoUser = rmoClient.getUserById(userId);
					masterEmpId = toLong(rmoUser.get("employeeId"));
					String rmoFull = str(rmoUser.get("fullName"));
					if (!blank(rmoFull))
						fullName = rmoFull;
				} catch (Exception ex) {
					log.warn("RMO user lookup failed for userId={}: {}", userId, ex.getMessage());
				}
			}

			// 4. Collect missing mandatory fields
			List<String> missing = collectMissing(email);
			if (!missing.isEmpty()) {
				String body = missingFieldsEmail(coalesce(email.getRequesterName(), fullName), missing);
				sendMail(coalesce(userEmail, email.getFromAddress()),
						"[ServiceEverZ] Ticket Submission Failed — Missing Fields", body);
				fail(audit, "Missing: " + missing);
				return;
			}

//            // 5. Validate values
//            List<String> errors = new ArrayList<>();
//            validateEmployeeId(email, masterEmpId, errors);
//            validateName(email, fullName, errors);
//            validatePriority(email, errors);
//            Long projectId = validateAndResolveProject(email, errors);

			// 5. Auto-fetch asset assigned to this user from asset-service
			Long assetId = null;
			String assetName = null;
			String assetTag = null;
			if (userId != null) {
				try {
					AssetInfo asset = fetchAssetByUser(userId);
					if (asset != null) {
						assetId = asset.assetId;
						assetName = asset.assetName;
						assetTag = asset.assetTag;
						log.info("Auto-resolved asset for userId={}: assetId={} name={}", userId, assetId, assetName);
					} else {
						log.info("No active asset mapping found for userId={}", userId);
					}
				} catch (Exception ex) {
					log.warn("Could not fetch asset for userId={}: {}", userId, ex.getMessage());
				}
			}

			// 6. Validate values
			List<String> errors = new ArrayList<>();
			validateEmployeeId(email, masterEmpId, errors);
			validateName(email, fullName, errors);
			validatePriority(email, errors);
			Long projectId = validateAndResolveProject(email, errors);

			if (!errors.isEmpty()) {
				String body = validationErrorEmail(coalesce(email.getRequesterName(), fullName), errors);
				sendMail(coalesce(userEmail, email.getFromAddress()),
						"[ServiceEverZ] Ticket Submission Failed — Validation Errors", body);
				fail(audit, "Validation: " + errors);
				return;
			}

			// 6. Build CreateTicketRequest payload and call ticket-service
			String requesterName = coalesce(fullName, email.getRequesterName());
			String subject = email.getCategory() + " | " + email.getSubCategory() + " | " + requesterName;

//            Map<String, Object> payload = buildPayload(
//                    userId, requesterName, projectId, email, subject);

			Map<String, Object> payload = buildPayload(userId, requesterName, projectId, assetId, assetName, assetTag,
					email, subject);

			Map<String, Object> ticketResponse = ticketClient.createAndSubmit(payload);

			// 7. Extract ticket number from ApiResponse<TicketResponse> wrapper
			String ticketNumber = extractTicketNumber(ticketResponse);
			Long ticketId = extractTicketId(ticketResponse);

			// 8. Send acknowledgement to requester
			String ackBody = ackEmail(requesterName, ticketNumber, email, assetName, assetTag);
			sendMail(coalesce(userEmail, email.getFromAddress()),
					"[ServiceEverZ] Ticket Raised Successfully — " + ticketNumber, ackBody);

			audit.setStatus("SUCCESS");
			audit.setTicketId(ticketId);
			audit.setTicketNumber(ticketNumber);
			audit.setProcessedAt(LocalDateTime.now());
			logRepo.save(audit);

			log.info("Email ticket created: ticketNumber={} for userId={}", ticketNumber, userId);

		} catch (UserNotFoundException ex) {
			String body = userNotFoundEmail(email.getFromAddress());
			sendMail(email.getFromAddress(), "[ServiceEverZ] Ticket Submission Failed — Unregistered Email", body);
			fail(audit, ex.getMessage());
		} catch (Exception ex) {
			log.error("processEmail failed for {}: {}", email.getFromAddress(), ex.getMessage(), ex);
			fail(audit, ex.getMessage());
		}
	}

	// =========================================================
	// IMAP POLL — called by scheduler
	// =========================================================
	public void pollInbox() {
	    Store store = null; Folder folder = null;
	    try {
	        Properties props = new Properties();
	        props.put("mail.store.protocol",   "imaps");
	        props.put("mail.imaps.host",       imapProperties.getHost());
	        props.put("mail.imaps.port",       String.valueOf(imapProperties.getPort()));
	        props.put("mail.imaps.ssl.enable", "true");
	        // FIX: disable Gmail's automatic SEEN marking on fetch
	        props.put("mail.imap.peek",        "true");
	        props.put("mail.imaps.peek",       "true");
	 
	        Session session = Session.getInstance(props);
	        store  = session.getStore("imaps");
	        store.connect(imapProperties.getHost(),
	                      imapProperties.getUsername(),
	                      imapProperties.getPassword());
	        folder = store.getFolder(imapProperties.getFolder());
	        folder.open(Folder.READ_WRITE);
	 
	        // FIX: fetch ALL messages and check our own DB for duplicates
	        // instead of relying on Gmail SEEN flag (Gmail marks SEEN on open)
	        Message[] messages = folder.getMessages();
	        log.info("IMAP poll: {} total messages in {}", messages.length, imapProperties.getFolder());
	 
	        int processed = 0;
	        for (Message msg : messages) {
	            try {
	                String subject = msg.getSubject();
	                if (subject == null) continue;
	 
	                // FIX: skip our own outbound notification/ack emails
	                // so we don't process replies we sent back to users
	                if (isOurOwnEmail(subject)) {
	                    log.debug("Skipping our own notification email: {}", subject);
	                    continue;
	                }
	 
	                // FIX: skip if not a ticket email (Category|SubCategory|Name format)
	                if (!isTicketEmail(subject)) {
	                    log.debug("Skipping non-ticket email: {}", subject);
	                    continue;
	                }
	 
	                // FIX: use Message-ID from header for deduplication
	                // instead of relying on SEEN flag
	                String[] messageIds = msg.getHeader("Message-ID");
	                String messageId = (messageIds != null && messageIds.length > 0)
	                        ? messageIds[0] : null;
	 
	                if (messageId != null && logRepo.existsByMessageId(messageId)) {
	                    log.debug("Already processed messageId={}, skipping", messageId);
	                    continue;
	                }
	 
	                log.info("Processing new ticket email: subject={}", subject);
	                ParsedEmail parsed = emailParser.parse(msg);
	                processEmail(parsed);
	                processed++;
	 
	            } catch (Exception ex) {
	                log.warn("Failed to process message #{}: {}",
	                        msg.getMessageNumber(), ex.getMessage());
	            }
	        }
	        log.info("IMAP poll complete — processed {} new ticket emails", processed);
	 
	    } catch (Exception ex) {
	        log.error("IMAP poll failed: {}", ex.getMessage(), ex);
	    } finally {
	        try { if (folder != null && folder.isOpen()) folder.close(false); } catch (Exception ignored) {}
	        try { if (store  != null && store.isConnected()) store.close();   } catch (Exception ignored) {}
	    }
	}
	 
	/**
	 * FIX: detect our own outbound emails so we never process them as inbound tickets.
	 * Our notification subjects all start with [ServiceEverZ].
	 */
	private boolean isOurOwnEmail(String subject) {
	    if (subject == null) return false;
	    String s = subject.toLowerCase();
	    return s.startsWith("[serviceeverz]")
	        || s.startsWith("re:")
	        || s.startsWith("fwd:")
	        || s.contains("delivery status notification")
	        || s.contains("undeliverable")
	        || s.contains("mail delivery failed")
	        || s.contains("automatic reply")
	        || s.contains("out of office");
	}
	 
 

	// =========================================================
	// VALIDATION
	// =========================================================
	private List<String> collectMissing(ParsedEmail e) {
		List<String> m = new ArrayList<>();
		if (blank(e.getCategory()))
			m.add("Category (in subject: Category|SubCategory|YourFullName)");
		if (blank(e.getSubCategory()))
			m.add("SubCategory (in subject: Category|SubCategory|YourFullName)");
		if (blank(e.getRequesterName()))
			m.add("Your Full Name (in subject: Category|SubCategory|YourFullName)");
		if (blank(e.getEmployeeId()))
			m.add("EmployeeId");
		if (blank(e.getProject()))
			m.add("Project");
		if (blank(e.getItem()))
			m.add("Item");
		if (blank(e.getPriority()))
			m.add("Priority");
		if (blank(e.getLocation()))
			m.add("Location");
		if (blank(e.getMobileNumber()))
			m.add("MobileNumber");
		if (blank(e.getDescription()))
			m.add("Description");
		return m;
	}

	private void validateEmployeeId(ParsedEmail e, Long masterEmpId, List<String> errors) {
		if (masterEmpId == null || blank(e.getEmployeeId()))
			return;
		try {
			if (Long.parseLong(e.getEmployeeId().trim()) != masterEmpId) {
				 
				errors.add("EmployeeId '" + e.getEmployeeId() + "' does not match your registered employee ID.");
			}
		} catch (NumberFormatException ex) {
			errors.add("EmployeeId must be a number. Got: '" + e.getEmployeeId() + "'.");
		}
	}

	private void validateName(ParsedEmail e, String masterName, List<String> errors) {
		if (blank(masterName) || blank(e.getRequesterName()))
			return;
		if (!masterName.trim().equalsIgnoreCase(e.getRequesterName().trim())) {
			errors.add("Name '" + e.getRequesterName() + "' does not match your registered name '" + masterName + "'.");
		}
	}

	private void validatePriority(ParsedEmail e, List<String> errors) {
		if (blank(e.getPriority()))
			return;
		String p = e.getPriority().toUpperCase();
		if (!p.equals("HIGH") && !p.equals("MEDIUM") && !p.equals("LOW")) {
			errors.add("Priority '" + e.getPriority() + "' is invalid. Use: HIGH, MEDIUM, or LOW.");
		}
	}

	private Long validateAndResolveProject(ParsedEmail e, List<String> errors) {
		if (blank(e.getProject()))
			return null;
		try {
			List<Map<String, Object>> projects = rmoClient.getAllProjects();
			for (Map<String, Object> p : projects) {
				String name = str(p.get("projectName"));
				if (e.getProject().equalsIgnoreCase(name))
					return toLong(p.get("id"));
			}
			errors.add("Project '" + e.getProject() + "' not found. Check the exact project name.");
		} catch (Exception ex) {
			log.warn("Project validation failed: {}", ex.getMessage());
			errors.add("Could not validate project '" + e.getProject() + "'. Please try again.");
		}
		return null;
	}

	private boolean isTicketEmail(String subject) {
		if (subject == null || subject.isBlank())
			return false;
		String[] parts = subject.split("\\|", -1);
		return parts.length >= 3 && !parts[0].trim().isBlank() && !parts[1].trim().isBlank()
				&& !parts[2].trim().isBlank();
	}

	// =========================================================
	// USER LOOKUP
	// =========================================================
	private Map<String, Object> fetchUserByEmail(String email) {
		if (blank(email))
			throw new UserNotFoundException("Sender email is blank.");
		try {
			Map<String, Object> data = userClient.getUserByEmail(email);
			if (data != null && data.get("id") != null)
				return data;
		} catch (Exception ex) {
			log.warn("user-service lookup failed for {}: {}", email, ex.getMessage());
		}
		throw new UserNotFoundException("Email [" + email + "] is not registered in ServiceEverZ.");
	}

	
	// =========================================================
    // ASSET LOOKUP — auto-fetch from asset-service by userId
    // =========================================================
 
    /** Simple holder for the asset data we care about. */
    private static class AssetInfo {
        final Long   assetId;
        final String assetName;
        final String assetTag;
        AssetInfo(Long assetId, String assetName, String assetTag) {
            this.assetId   = assetId;
            this.assetName = assetName;
            this.assetTag  = assetTag;
        }
    }
 
    /**
     * Calls asset-service GET /api/asset-mappings/user/{userId}.
     * Returns the first active/approved asset mapping for the user.
     * Returns null if the user has no asset assigned.
     */
    @SuppressWarnings("unchecked")
    private AssetInfo fetchAssetByUser(Long userId) {
        Map<String, Object> response = assetClient.getAssetMappingsByUser(userId);
        if (response == null) return null;
 
        // Response is ApiResponse<List<AssetMappingResponse>>
        // unwrap: { success: true, data: [ { assetId, assetName, assetTag, status }, ... ] }
        Object dataObj = response.get("data");
        if (!(dataObj instanceof List)) return null;
 
        List<Map<String, Object>> mappings = (List<Map<String, Object>>) dataObj;
 
        // Prefer ACTIVE or APPROVED status; fall back to first entry if nothing active
        Map<String, Object> best = null;
        for (Map<String, Object> m : mappings) {
            String status = str(m.get("status"));
            // Active mappings: status is ACTIVE, APPROVED, or MANAGER_APPROVED
            if (status != null && (status.contains("APPROVED") || status.equals("ACTIVE"))) {
                best = m;
                break;
            }
        }
        // Fallback — just take the first mapping even if pending
        if (best == null && !mappings.isEmpty()) {
            best = mappings.get(0);
        }
 
        if (best == null) return null;
 
        Long   assetId   = toLong(best.get("assetId"));
        String assetName = str(best.get("assetName"));
        String assetTag  = str(best.get("assetTag"));
 
        if (assetId == null && blank(assetName)) return null;
        return new AssetInfo(assetId, assetName, assetTag);
    }
 
	
	// =========================================================
	// PAYLOAD BUILDER — matches CreateTicketRequest exactly
	// =========================================================
	private Map<String, Object> buildPayload(Long userId, String requesterName, Long projectId, Long assetId,
			String assetName, String assetTag, ParsedEmail e, String subject) {
		Map<String, Object> p = new LinkedHashMap<>();
		// Requester — matches CreateTicketRequest.requestedById / requestedByName
		p.put("requestedById", userId);
		p.put("requestedByName", requesterName);
		// Service hierarchy — names only (ticket-service stores them as strings)
		p.put("category", e.getCategory());
		p.put("subCategory", e.getSubCategory());
		p.put("item", e.getItem());
		// Priority — set both fields so getEffectivePriority() picks it up
		String priority = coalesce(e.getPriority(), "MEDIUM").toUpperCase();
		p.put("priority", priority);
		p.put("priorityName", priority);
		// Project
		p.put("projectId", projectId);
		// Ticket content
		p.put("subject", subject);
		p.put("description", e.getDescription());
		p.put("location", e.getLocation());
		p.put("mobileNumber", e.getMobileNumber());
		// Optional
		if (assetId != null)
			p.put("assetId", assetId);
		if (assetName != null)
			p.put("asset", assetName); // display label
//		if (e.getAccessRequiredTill() != null)
//			p.put("accessRequiredTill", e.getAccessRequiredTill().toString());
		if (e.getAccessRequiredTill() != null)
		    // ticket-service CreateTicketRequest.accessRequiredTill is LocalDateTime
		    p.put("accessRequiredTill", e.getAccessRequiredTill().atStartOfDay().toString());
		 
		// Attachment (first valid one)
		if (!e.getAttachments().isEmpty()) {
		    ParsedEmail.Attachment att = e.getAttachments().get(0);
		    p.put("attachmentName", att.getFilename());
		    p.put("attachmentSizeBytes", att.getSizeBytes());
		    p.put("attachmentBase64", java.util.Base64.getEncoder().encodeToString(att.getContent()));
		    p.put("attachmentMimeType", att.getContentType());
		}
		// Mode — always Email for this service
		p.put("mode", "EMAIL");
		return p;
	}

	// =========================================================
	// RESPONSE EXTRACTORS
	// =========================================================
	@SuppressWarnings("unchecked")
	private String extractTicketNumber(Map<String, Object> response) {
		try {
			Object data = response.get("data");
			if (data instanceof Map) {
				Object tn = ((Map<String, Object>) data).get("ticketNumber");
				if (tn != null)
					return tn.toString();
			}
		} catch (Exception ignored) {
		}
		return "UNKNOWN";
	}

	@SuppressWarnings("unchecked")
	private Long extractTicketId(Map<String, Object> response) {
		try {
			Object data = response.get("data");
			if (data instanceof Map)
				return toLong(((Map<String, Object>) data).get("ticketId"));
		} catch (Exception ignored) {
		}
		return null;
	}

	// =========================================================
	// EMAIL TEMPLATES
	// =========================================================
	private String ackEmail(String name, String ticketNumber, ParsedEmail e,
            String assetName, String assetTag) {
		return "Dear " + name + ",\n\n" + "Your IT support ticket has been successfully raised.\n\n"
				+ "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" + "  TICKET NUMBER    : " + ticketNumber + "\n"
				+ "  Category         : " + e.getCategory() + "\n" + "  Sub-Category     : " + e.getSubCategory() + "\n"
				+ "  Item             : " + e.getItem() + "\n" + "  Priority         : "
				+ coalesce(e.getPriority(), "MEDIUM") + "\n" + "  Project          : " + coalesce(e.getProject(), "N/A")
				+ "\n"
//            + "  Location         : " + e.getLocation() + "\n"
				+ "  Location         : " + e.getLocation() + "\n"
				+ (assetName != null
						? "  Asset            : " + assetName + (assetTag != null ? " (" + assetTag + ")" : "") + "\n"
						: "")
				+ "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
				+ "Your ticket has been sent for L1 approval. You will receive email\n"
				+ "updates at each stage of the approval and resolution process.\n\n"
				+ "You can also track your ticket status by logging in to the\n"
				+ "ServiceEverZ portal under 'My Tickets'.\n\n" + "Thank you,\nServiceEverZ Team";
	}

	private String missingFieldsEmail(String name, List<String> missing) {
		String list = missing.stream().map(f -> "  • " + f).collect(Collectors.joining("\n"));
		return "Dear " + name + ",\n\n" + "Your ticket submission was received but could not be processed\n"
				+ "because the following mandatory fields are missing:\n\n" + list + "\n\n"
				+ "Please reply with the correct format shown below and try again.\n\n" + emailFormatGuide()
				+ "\nThank you,\nServiceEverZ Team";
	}

	private String validationErrorEmail(String name, List<String> errors) {
		String list = errors.stream().map(e -> "  • " + e).collect(Collectors.joining("\n"));
		return "Dear " + name + ",\n\n" + "Your ticket submission could not be processed due to the\n"
				+ "following validation errors:\n\n" + list + "\n\n"
				+ "Please correct the errors and send the email again.\n\n" + emailFormatGuide()
				+ "\nThank you,\nServiceEverZ Team";
	}

	private String userNotFoundEmail(String email) {
		return "Hello,\n\n" + "We received a ticket request from [" + email + "], but this\n"
				+ "email address is not registered in the ServiceEverZ system.\n\n"
				+ "Please contact your IT administrator to register your account,\n"
				+ "or raise the ticket from your registered company email address.\n\n"
				+ "Thank you,\nServiceEverZ Team";
	}

	private String emailFormatGuide() {
		return "═══════════════════════════════════════════\n" + "HOW TO RAISE A TICKET VIA EMAIL\n"
				+ "═══════════════════════════════════════════\n" + "TO      : relevantz.servicedesk@gmail.com\n"
				+ "SUBJECT : Category|SubCategory|YourFullName\n" + "  Example: Hardware|Laptop Issues|John Smith\n\n"
				+ "BODY (each field on its own line):\n" + "  EmployeeId         : 1001\n"
				+ "  Project            : ServiceEverZ\n" + "  Item               : Laptop Replacement\n"
				+ "  Priority           : HIGH\n" + "  Location           : Chennai - Block A, Floor 2\n"
				+ "  MobileNumber       : 9876543210\n" + "  Description        : Describe your issue here...\n"
				+ "  Asset              : LPT-00234   (optional)\n"
				+ "  AccessRequiredTill : 2026-06-30  (optional, YYYY-MM-DD)\n"
				+ "═══════════════════════════════════════════\n";
	}

	// =========================================================
	// SMTP SENDER — uses Spring JavaMailSender directly
	// =========================================================
	private void sendMail(String to, String subject, String body) {
		try {
			jakarta.mail.internet.MimeMessage mime = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mime, false, "UTF-8");
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(body, false);
			mailSender.send(mime);
			log.info("Email sent to={} subject={}", to, subject);
		} catch (Exception ex) {
			log.error("Failed to send email to {}: {}", to, ex.getMessage());
		}
	}

	// =========================================================
	// AUDIT LOG HELPERS
	// =========================================================
	private InboundEmailLog newLog(ParsedEmail e) {
		InboundEmailLog l = new InboundEmailLog();
		l.setMessageId(e.getMessageId());
		l.setFromAddress(e.getFromAddress());
		l.setRawSubject(e.getRawSubject());
		l.setStatus("PROCESSING");
		l.setProcessedAt(LocalDateTime.now());
		return l;
	}

	private void fail(InboundEmailLog l, String msg) {
		l.setStatus("FAILED");
		l.setErrorMessage(msg);
		l.setProcessedAt(LocalDateTime.now());
		logRepo.save(l);
	}

	// =========================================================
	// UTILITIES
	// =========================================================
	private String buildFullName(String first, String last) {
		if (blank(first) && blank(last))
			return null;
		if (blank(first))
			return last;
		if (blank(last))
			return first;
		return first.trim() + " " + last.trim();
	}

	private String str(Object o) {
		return o instanceof String s ? s : (o != null ? o.toString() : null);
	}

	private Long toLong(Object o) {
		if (o == null)
			return null;
		if (o instanceof Number n)
			return n.longValue();
		try {
			return Long.parseLong(o.toString());
		} catch (Exception e) {
			return null;
		}
	}

	private String coalesce(String a, String b) {
		return (!blank(a)) ? a : b;
	}

	private boolean blank(String s) {
		return s == null || s.isBlank();
	}
}