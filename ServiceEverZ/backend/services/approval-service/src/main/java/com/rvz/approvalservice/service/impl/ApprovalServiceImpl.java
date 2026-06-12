package com.rvz.approvalservice.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rvz.approvalservice.client.AssignmentClient;
import com.rvz.approvalservice.client.MailClient;
import com.rvz.approvalservice.client.MasterDataClient;
import com.rvz.approvalservice.client.SlaClient;
import com.rvz.approvalservice.client.TicketClient;
import com.rvz.approvalservice.config.ApprovalConstants;
import com.rvz.approvalservice.config.ApprovalMapper;
import com.rvz.approvalservice.dto.request.ApprovalActionRequest;
import com.rvz.approvalservice.dto.request.AssignmentTriggerRequest;
import com.rvz.approvalservice.dto.request.EmailRequest;
import com.rvz.approvalservice.dto.request.InitiateApprovalRequest;
import com.rvz.approvalservice.dto.response.ApprovalResponse;
import com.rvz.approvalservice.entity.TicketApproval;
import com.rvz.approvalservice.entity.TicketHistory;
import com.rvz.approvalservice.entity.TicketStatus;
import com.rvz.approvalservice.exception.ApprovalException;
import com.rvz.approvalservice.exception.ResourceNotFoundException;
import com.rvz.approvalservice.repository.TicketApprovalRepository;
import com.rvz.approvalservice.repository.TicketHistoryRepository;
import com.rvz.approvalservice.service.ApprovalService;

@Service
@Transactional
public class ApprovalServiceImpl implements ApprovalService {

	private static final Logger log = LoggerFactory.getLogger(ApprovalServiceImpl.class);
	private static final String KEY_DATA = "data";
	private static final String KEY_EMAIL = "email";
	private static final String KEY_FIRST_NAME = "firstName";
	private static final String KEY_LAST_NAME = "lastName";
	private static final String KEY_L1_MGR = "l1ManagerId";
	private static final String KEY_L2_MGR = "l2ManagerId";
	private static final String KEY_RO = "resourceOwnerId";
	private static final String KEY_PRIORITY = "priority";
	private static final String KEY_SLA_MIN = "slaMinutes";
	private static final String KEY_TICKET_ID = "ticketId";

	private final TicketApprovalRepository approvalRepository;
	private final ApprovalMapper approvalMapper;
	private final MailClient mailClient;
	private final MasterDataClient masterDataClient;
	private final TicketClient ticketClient;
	private final AssignmentClient assignmentClient;
	private final SlaClient slaClient;
	private final TicketHistoryRepository historyRepository;

	public ApprovalServiceImpl(TicketApprovalRepository approvalRepository, ApprovalMapper approvalMapper,
			MailClient mailClient, MasterDataClient masterDataClient, TicketClient ticketClient,
			AssignmentClient assignmentClient, SlaClient slaClient, TicketHistoryRepository historyRepository) {
		this.approvalRepository = approvalRepository;
		this.approvalMapper = approvalMapper;
		this.mailClient = mailClient;
		this.masterDataClient = masterDataClient;
		this.ticketClient = ticketClient;
		this.assignmentClient = assignmentClient;
		this.slaClient = slaClient;
		this.historyRepository = historyRepository;
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 1. INITIATE APPROVAL
	// ═══════════════════════════════════════════════════════════════════════
	@Override
	public ApprovalResponse initiateApproval(InitiateApprovalRequest request) {
		log.info("Initiating approval workflow for ticketId={}", request.getTicketId());
		return approvalRepository.findByTicketId(request.getTicketId()).map(existing -> {
			log.info("Approval already exists for ticketId={}, returning existing", request.getTicketId());
			return approvalMapper.toResponse(existing);
		}).orElseGet(() -> createNewApproval(request));
	}

	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getAllPendingL1() {
		return approvalRepository.findAllPendingL1().stream()
				.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())).map(approvalMapper::toResponse)
				.collect(java.util.stream.Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getAllPendingL2() {
		return approvalRepository.findAllPendingL2().stream()
				.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())).map(approvalMapper::toResponse)
				.collect(java.util.stream.Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getAllFullyApproved() {
		return approvalRepository.findAllFullyApproved().stream()
				.sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt())).map(approvalMapper::toResponse)
				.collect(java.util.stream.Collectors.toList());
	}

	private ApprovalResponse createNewApproval(InitiateApprovalRequest request) {
		ProjectManagers managers = fetchProjectManagers(request.getProjectId());
		UserDetail l1Detail = fetchUserDetail(managers.l1ManagerId);
		UserDetail l2Detail = fetchUserDetail(managers.l2ManagerId);
		UserDetail roDetail = fetchUserDetail(managers.resourceOwnerId);

		String l1Email = resolveValue(l1Detail.email, request.getL1ApproverEmail());
		String l1Name = resolveValue(l1Detail.name, request.getL1ApproverName());
		String l2Email = resolveValue(l2Detail.email, request.getL2ApproverEmail());
		String l2Name = resolveValue(l2Detail.name, request.getL2ApproverName());
		String roEmail = resolveValue(roDetail.email, request.getResourceOwnerEmail());
		String roName = resolveValue(roDetail.name, request.getResourceOwnerName());

		TicketApproval approval = buildApprovalEntity(request, managers, l1Email, l1Name, l2Email, l2Name, roEmail,
				roName);
		TicketApproval saved = approvalRepository.save(approval);
		sendL1RequestEmail(saved, request.getTicketSubject(), request.getRequesterName());
		log.info("Approval created for ticketId={}. L1 email dispatched to '{}'", request.getTicketId(), l1Email);
		return approvalMapper.toResponse(saved);
	}

	private TicketApproval buildApprovalEntity(InitiateApprovalRequest request, ProjectManagers managers,
			String l1Email, String l1Name, String l2Email, String l2Name, String roEmail, String roName) {
		TicketApproval approval = new TicketApproval();
		approval.setTicketId(request.getTicketId());
		// FIX 3: store display fields so queue pages render without an extra call
		approval.setTicketNumber(request.getTicketNumber());
		approval.setTicketSubject(request.getTicketSubject());
		approval.setRequesterName(request.getRequesterName());
		approval.setRequesterEmail(request.getRequesterEmail());
		approval.setL1ApproverId(
				managers.l1ManagerId != null ? String.valueOf(managers.l1ManagerId) : request.getL1ApproverId());
		approval.setL1ApproverEmail(l1Email);
		approval.setL1ApproverName(l1Name);
		approval.setL1Status(ApprovalConstants.PENDING);
		approval.setL2ApproverId(
				managers.l2ManagerId != null ? String.valueOf(managers.l2ManagerId) : request.getL2ApproverId());
		approval.setL2ApproverEmail(l2Email);
		approval.setL2ApproverName(l2Name);
		approval.setL2Status(ApprovalConstants.PENDING);
		boolean needsResourceApproval = request.isRequiresResourceApproval();
		approval.setRequiresResourceApproval(needsResourceApproval);
		approval.setResourceOwnerId(managers.resourceOwnerId != null ? String.valueOf(managers.resourceOwnerId)
				: request.getResourceOwnerId());
		approval.setResourceOwnerEmail(roEmail);
		approval.setResourceOwnerName(roName);
		approval.setResourceOwnerStatus(
				needsResourceApproval ? ApprovalConstants.PENDING : ApprovalConstants.NOT_REQUIRED);
		approval.setOverallStatus(ApprovalConstants.PENDING);
		approval.setCreatedAt(LocalDateTime.now());
		approval.setUpdatedAt(LocalDateTime.now());
		return approval;
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 2. PROCESS APPROVAL
	// ═══════════════════════════════════════════════════════════════════════
	@Override
	public ApprovalResponse processApproval(ApprovalActionRequest request) {
		TicketApproval approval = approvalRepository.findByTicketId(request.getTicketId()).orElseThrow(
				() -> new ResourceNotFoundException(ApprovalConstants.APPROVAL_NOT_FOUND + request.getTicketId()));
		String level = request.getApproverLevel().trim().toUpperCase();
		String action = request.getAction().trim().toUpperCase();
		if (!ApprovalConstants.APPROVED.equals(action) && !ApprovalConstants.REJECTED.equals(action)
				&& !"NEED_INFO".equals(action)) {
			throw new ApprovalException("Action must be APPROVED, REJECTED, or NEED_INFO");
		}

		switch (level) {
		case "L1" -> processL1(approval, action, request.getRemarks());
		case "L2" -> processL2(approval, action, request.getRemarks());
		case "RESOURCE" -> processResourceOwner(approval, action, request.getRemarks());
		default -> throw new ApprovalException("Invalid approver level: " + level);
		}
		// ✅ FIX: Write a history row that reflects the real outcome of this stage.
		// CANCELLED  = any rejection (red in UI)
		// OPEN       = intermediate approval (L1 done, waiting for L2)
		// PENDING_USER_ACK = fully approved and assigned to support (ticket is now live)
		boolean isRejected   = "REJECTED".equalsIgnoreCase(action);
		boolean isFullyDone  = ApprovalConstants.APPROVED.equals(approval.getOverallStatus());
		TicketStatus histStatus = isRejected  ? TicketStatus.CANCELLED
		                        : isFullyDone ? TicketStatus.OPEN   // overall approved → ticket is open/active
		                        :               TicketStatus.OPEN;  // partial (L1 done, awaiting L2)

		String remarkSuffix = (request.getRemarks() != null && !request.getRemarks().isBlank())
				? " — " + request.getRemarks() : "";
		String actorLabel = request.getApproverLevel() + " Manager";

		TicketHistory history = new TicketHistory();
		history.setTicketId(request.getTicketId());
		history.setStatus(histStatus);
		history.setChangedByName(actorLabel);
		history.setChangedBy(null);
		history.setRemarks(action + " By " + actorLabel + remarkSuffix);
		history.setCreatedAt(LocalDateTime.now());
		historyRepository.save(history);

		// ✅ FIX: When fully approved, write a second "Fully Approved" history entry
		// so the History tab shows the complete transition to active support status.
		if (isFullyDone) {
			TicketHistory fullyApproved = new TicketHistory();
			fullyApproved.setTicketId(request.getTicketId());
			fullyApproved.setStatus(TicketStatus.OPEN);
			fullyApproved.setChangedByName("SD Bot");
			fullyApproved.setChangedBy(null);
			fullyApproved.setRemarks("Fully approved — ticket assigned to support team and SLA started");
			fullyApproved.setCreatedAt(LocalDateTime.now());
			historyRepository.save(fullyApproved);
		}

		approval.setUpdatedAt(LocalDateTime.now());
		return approvalMapper.toResponse(approvalRepository.save(approval));
	}

	private void processL1(TicketApproval approval, String action, String remarks) {
		if ("NEED_INFO".equals(action)) {
		    sendEmailSafe(approval.getRequesterEmail(),
		            "Additional Information Needed — Ticket #" + approval.getTicketId(),
		            "Dear Requester,\n\nThe L1 approver has reviewed your ticket #" + approval.getTicketId()
		                    + " and requires additional information:\n\n" + remarks
		                    + "\n\nPlease update your ticket with the requested details.\n\nRegards,\nServiceEverz");
		    approval.setRemarks("NEED_INFO: " + remarks);
//		    try {
//		        ticketClient.setAllowUserReply(approval.getTicketId(), java.util.Map.of("allowUserReply", true));
//		        ticketClient.addComment(approval.getTicketId(), java.util.Map.of(
//		            "body",       remarks,
//		            "authorId",   Long.parseLong(approval.getL1ApproverId()),
//		            "authorName", approval.getL1ApproverName() != null ? approval.getL1ApproverName() : "L1 Approver",
//		            "authorRole", "L1_APPROVER",
//		            "channel",    "L1_USER"
//		        ));
//		    } catch (Exception ex) {
//		        log.warn("Could not save L1 NEED_INFO comment for ticketId={}: {}", approval.getTicketId(), ex.getMessage());
//		    }
		    try {
		        ticketClient.setAllowUserReply(approval.getTicketId(), java.util.Map.of("allowUserReply", true));
		        java.util.Map<String, Object> l1Body = new java.util.HashMap<>();
		        l1Body.put("body",       remarks);
		        l1Body.put("authorId",   approval.getL1ApproverId() != null ? Long.parseLong(approval.getL1ApproverId()) : 0L);
		        l1Body.put("authorName", approval.getL1ApproverName() != null ? approval.getL1ApproverName() : "L1 Approver");
		        l1Body.put("authorRole", "L1_APPROVER");
		        l1Body.put("channel",    "L1_USER");
		        log.info("Saving L1 NEED_INFO comment for ticketId={}, approverId={}", approval.getTicketId(), approval.getL1ApproverId());
		        ticketClient.addComment(approval.getTicketId(), l1Body);
		        log.info("L1 NEED_INFO comment saved successfully for ticketId={}", approval.getTicketId());
		    } catch (Exception ex) {
		        log.error("Could not save L1 NEED_INFO comment for ticketId={}: {}", approval.getTicketId(), ex.getMessage(), ex);
		    }
		    return;
		}
		 
		if (!ApprovalConstants.PENDING.equals(approval.getL1Status())) {
			throw new ApprovalException("L1 approval already processed with status: " + approval.getL1Status());
		}
		approval.setL1Status(action);
		approval.setRemarks(remarks);
		String requesterEmail = approval.getRequesterEmail();
		if (ApprovalConstants.REJECTED.equals(action)) {
			approval.setOverallStatus(ApprovalConstants.REJECTED);
			approval.setL2Status(ApprovalConstants.L1_REJECTED);
			if (Boolean.TRUE.equals(approval.getRequiresResourceApproval())) {
				approval.setResourceOwnerStatus(ApprovalConstants.L1_REJECTED);
			}
			sendEmailSafe(requesterEmail, "Ticket #" + approval.getTicketId() + " - Rejected at L1 Review",
					buildRejectionEmailBody("L1", approval.getL1ApproverName(), approval.getTicketId(), remarks));
			log.info("L1 REJECTED ticketId={}", approval.getTicketId());
		} else {
			sendEmailSafe(approval.getL2ApproverEmail(),
					"Action Required: L2 Approval - Ticket #" + approval.getTicketId(), buildL2RequestEmailBody(
							approval.getL2ApproverName(), approval.getTicketId(), approval.getL1ApproverName()));
			sendEmailSafe(requesterEmail, "Ticket #" + approval.getTicketId() + " - L1 Approved, Awaiting L2",
					buildProgressEmailBody(approval.getTicketId(), "L1", approval.getL1ApproverName(), "L2 Review"));
			log.info("L1 APPROVED ticketId={} | L2 notified at '{}'", approval.getTicketId(),
					approval.getL2ApproverEmail());
		}
	}

	private void processL2(TicketApproval approval, String action, String remarks) {
		if ("NEED_INFO".equals(action)) {
		    sendEmailSafe(approval.getRequesterEmail(),
		            "Additional Information Needed — Ticket #" + approval.getTicketId(),
		            "Dear Requester,\n\nThe L2 approver has reviewed your ticket #" + approval.getTicketId()
		                    + " and requires additional information:\n\n" + remarks
		                    + "\n\nPlease update your ticket with the requested details.\n\nRegards,\nServiceEverz");
		    approval.setRemarks("NEED_INFO: " + remarks);
//		    try {
//		        ticketClient.setAllowUserReply(approval.getTicketId(), java.util.Map.of("allowUserReply", true));
//		        ticketClient.addComment(approval.getTicketId(), java.util.Map.of(
//		            "body",       remarks,
//		            "authorId",   Long.parseLong(approval.getL2ApproverId()),
//		            "authorName", approval.getL2ApproverName() != null ? approval.getL2ApproverName() : "L2 Approver",
//		            "authorRole", "L2_APPROVER",
//		            "channel",    "L2_USER"
//		        ));
//		    } catch (Exception ex) {
//		        log.warn("Could not save L2 NEED_INFO comment for ticketId={}: {}", approval.getTicketId(), ex.getMessage());
//		    }
		    try {
		        ticketClient.setAllowUserReply(approval.getTicketId(), java.util.Map.of("allowUserReply", true));
		        java.util.Map<String, Object> l2Body = new java.util.HashMap<>();
		        l2Body.put("body",       remarks);
		        l2Body.put("authorId",   approval.getL2ApproverId() != null ? Long.parseLong(approval.getL2ApproverId()) : 0L);
		        l2Body.put("authorName", approval.getL2ApproverName() != null ? approval.getL2ApproverName() : "L2 Approver");
		        l2Body.put("authorRole", "L2_APPROVER");
		        l2Body.put("channel",    "L2_USER");
		        log.info("Saving L2 NEED_INFO comment for ticketId={}, approverId={}", approval.getTicketId(), approval.getL2ApproverId());
		        ticketClient.addComment(approval.getTicketId(), l2Body);
		        log.info("L2 NEED_INFO comment saved successfully for ticketId={}", approval.getTicketId());
		    } catch (Exception ex) {
		        log.error("Could not save L2 NEED_INFO comment for ticketId={}: {}", approval.getTicketId(), ex.getMessage(), ex);
		    }
		    return;
		}
		 
		if (!ApprovalConstants.APPROVED.equals(approval.getL1Status())) {
			throw new ApprovalException("L2 cannot act before L1 approval is completed");
		}
		if (!ApprovalConstants.PENDING.equals(approval.getL2Status())) {
			throw new ApprovalException("L2 approval already processed with status: " + approval.getL2Status());
		}
		approval.setL2Status(action);
		approval.setRemarks(remarks);
		String requesterEmail = approval.getRequesterEmail();
		if (ApprovalConstants.REJECTED.equals(action)) {
			approval.setOverallStatus(ApprovalConstants.REJECTED);
			if (Boolean.TRUE.equals(approval.getRequiresResourceApproval())) {
				approval.setResourceOwnerStatus(ApprovalConstants.REJECTED);
			}
			sendEmailSafe(requesterEmail, "Ticket #" + approval.getTicketId() + " - Rejected at L2 Review",
					buildRejectionEmailBody("L2", approval.getL2ApproverName(), approval.getTicketId(), remarks));
			log.info("L2 REJECTED ticketId={}", approval.getTicketId());
		} else if (Boolean.TRUE.equals(approval.getRequiresResourceApproval())) {
			sendEmailSafe(approval.getResourceOwnerEmail(),
					"Action Required: Resource Owner Approval - Ticket #" + approval.getTicketId(),
					buildResourceOwnerRequestEmailBody(approval.getResourceOwnerName(), approval.getTicketId(),
							approval.getL1ApproverName(), approval.getL2ApproverName()));
			sendEmailSafe(requesterEmail,
					"Ticket #" + approval.getTicketId() + " - L2 Approved, Awaiting Resource Owner",
					buildProgressEmailBody(approval.getTicketId(), "L2", approval.getL2ApproverName(),
							"Resource Owner Review"));
			log.info("L2 APPROVED (resource needed) ticketId={} | RO notified at '{}'", approval.getTicketId(),
					approval.getResourceOwnerEmail());
		} else {
			approval.setOverallStatus(ApprovalConstants.APPROVED);
			triggerAssignmentAndSla(approval.getTicketId());
			sendEmailSafe(requesterEmail, "Ticket #" + approval.getTicketId() + " - Fully Approved",
					buildFullyApprovedEmailBody(approval.getTicketId(), approval.getL2ApproverName()));
			log.info("L2 APPROVED (no resource needed) ticketId={} | assignment triggered", approval.getTicketId());
		}
	}

	private void processResourceOwner(TicketApproval approval, String action, String remarks) {
		if (!Boolean.TRUE.equals(approval.getRequiresResourceApproval())) {
			throw new ApprovalException("Resource owner approval is not required for this ticket");
		}
		if (!ApprovalConstants.APPROVED.equals(approval.getL2Status())) {
			throw new ApprovalException("Resource owner cannot act before L2 approval is completed");
		}
		if (!ApprovalConstants.PENDING.equals(approval.getResourceOwnerStatus())) {
			throw new ApprovalException("Resource owner approval already processed");
		}
		if ("NEED_INFO".equals(action)) {
		    sendEmailSafe(approval.getRequesterEmail(),
		            "Additional Information Needed — Ticket #" + approval.getTicketId(),
		            "Dear Requester,\n\nThe Resource Owner has reviewed your ticket #" + approval.getTicketId()
		                    + " and requires additional information:\n\n" + remarks
		                    + "\n\nPlease update your ticket with the requested details.\n\nRegards,\nServiceEverz");
		    approval.setRemarks("NEED_INFO: " + remarks);
//		    try {
//		        ticketClient.setAllowUserReply(approval.getTicketId(), java.util.Map.of("allowUserReply", true));
//		        ticketClient.addComment(approval.getTicketId(), java.util.Map.of(
//		            "body",       remarks,
//		            "authorId",   Long.parseLong(approval.getResourceOwnerId()),
//		            "authorName", approval.getResourceOwnerName() != null ? approval.getResourceOwnerName() : "Resource Owner",
//		            "authorRole", "RESOURCE_APPROVER",
//		            "channel",    "RESOURCE_USER"
//		        ));
//		    } catch (Exception ex) {
//		        log.warn("Could not save RESOURCE NEED_INFO comment for ticketId={}: {}", approval.getTicketId(), ex.getMessage());
//		    }
		    try {
		        ticketClient.setAllowUserReply(approval.getTicketId(), java.util.Map.of("allowUserReply", true));
		        java.util.Map<String, Object> roBody = new java.util.HashMap<>();
		        roBody.put("body",       remarks);
		        roBody.put("authorId",   approval.getResourceOwnerId() != null ? Long.parseLong(approval.getResourceOwnerId()) : 0L);
		        roBody.put("authorName", approval.getResourceOwnerName() != null ? approval.getResourceOwnerName() : "Resource Owner");
		        roBody.put("authorRole", "RESOURCE_APPROVER");
		        roBody.put("channel",    "RESOURCE_USER");
		        log.info("Saving RESOURCE NEED_INFO comment for ticketId={}, approverId={}", approval.getTicketId(), approval.getResourceOwnerId());
		        ticketClient.addComment(approval.getTicketId(), roBody);
		        log.info("RESOURCE NEED_INFO comment saved successfully for ticketId={}", approval.getTicketId());
		    } catch (Exception ex) {
		        log.error("Could not save RESOURCE NEED_INFO comment for ticketId={}: {}", approval.getTicketId(), ex.getMessage(), ex);
		    }
		    return;
		}
		 
		approval.setResourceOwnerStatus(action);
		approval.setRemarks(remarks);
		approval.setOverallStatus(action);
		String requesterEmail = approval.getRequesterEmail();
		if (ApprovalConstants.APPROVED.equals(action)) {
			triggerAssignmentAndSla(approval.getTicketId());
			String roApproverName = (approval.getResourceOwnerName() != null
					&& !approval.getResourceOwnerName().isBlank()) ? approval.getResourceOwnerName() : "Resource Owner";
			sendEmailSafe(requesterEmail, "Ticket #" + approval.getTicketId() + " - Fully Approved",
					buildFullyApprovedEmailBody(approval.getTicketId(), roApproverName));
			// ✅ FIX: Write a "Fully Approved" history entry so History tab shows this event
			TicketHistory roApproved = new TicketHistory();
			roApproved.setTicketId(approval.getTicketId());
			roApproved.setStatus(TicketStatus.OPEN);
			roApproved.setChangedByName("SD Bot");
			roApproved.setChangedBy(null);
			roApproved.setRemarks("Fully approved by Resource Owner — ticket assigned to support team and SLA started");
			roApproved.setCreatedAt(LocalDateTime.now());
			historyRepository.save(roApproved);
			log.info("RESOURCE OWNER APPROVED ticketId={} | assignment triggered", approval.getTicketId());
		} else {
			String roRejectorName = (approval.getResourceOwnerName() != null
					&& !approval.getResourceOwnerName().isBlank()) ? approval.getResourceOwnerName() : "Resource Owner";
			sendEmailSafe(requesterEmail, "Ticket #" + approval.getTicketId() + " - Rejected by Resource Owner",
					buildRejectionEmailBody("Resource Owner", roRejectorName, approval.getTicketId(), remarks));
			log.info("RESOURCE OWNER REJECTED ticketId={}", approval.getTicketId());
		}
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 3. QUERIES
	// ═══════════════════════════════════════════════════════════════════════
	@Override
	@Transactional(readOnly = true)
	public ApprovalResponse getApprovalStatus(Long ticketId) {
		return approvalMapper.toResponse(approvalRepository.findByTicketId(ticketId)
				.orElseThrow(() -> new ResourceNotFoundException(ApprovalConstants.APPROVAL_NOT_FOUND + ticketId)));
	}

	// FIX 2: scoped by approverId — only this user's assigned tickets appear in
	// their queue
	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getPendingL1Approvals(String approverId) {
		List<TicketApproval> results = (approverId != null && !approverId.isBlank())
				? approvalRepository.findPendingL1ByApproverId(approverId)
				: approvalRepository.findAllPendingL1();
		return results.stream().map(approvalMapper::toResponse).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getPendingL2Approvals(String approverId) {
		List<TicketApproval> results = (approverId != null && !approverId.isBlank())
				? approvalRepository.findPendingL2ByApproverId(approverId)
				: approvalRepository.findAllPendingL2();
		return results.stream().map(approvalMapper::toResponse).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getPendingResourceOwnerApprovals(String approverId) {
		List<TicketApproval> results = (approverId != null && !approverId.isBlank())
				? approvalRepository.findPendingResourceOwnerByApproverId(approverId)
				: approvalRepository.findAllPendingResourceOwner();
		return results.stream().map(approvalMapper::toResponse).collect(Collectors.toList());
	}

	// FIX 3: history — already processed by this approver
	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getL1History(String approverId) {
		List<TicketApproval> results = (approverId != null && !approverId.isBlank())
				? approvalRepository.findL1HistoryByApproverId(approverId)
				: approvalRepository.findAll().stream().filter(a -> !"PENDING".equals(a.getL1Status()))
						.collect(Collectors.toList());
		return results.stream().sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
				.map(approvalMapper::toResponse).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getL2History(String approverId) {
		List<TicketApproval> results = (approverId != null && !approverId.isBlank())
				? approvalRepository.findL2HistoryByApproverId(approverId)
				: approvalRepository.findAll().stream()
						.filter(a -> !"PENDING".equals(a.getL2Status()) && !"L1_REJECTED".equals(a.getL2Status()))
						.collect(Collectors.toList());
		return results.stream().sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
				.map(approvalMapper::toResponse).collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getPendingForApprover(String approverId) {
		if (approverId == null || approverId.isBlank())
			return List.of();
		return approvalRepository.findAllPendingForApprover(approverId).stream()
				.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())).map(approvalMapper::toResponse)
				.collect(java.util.stream.Collectors.toList());
	}

	/**
	 * UNIFIED HISTORY — all tickets this approver has already processed (whether as
	 * L1 or L2).
	 */
	@Override
	@Transactional(readOnly = true)
	public List<ApprovalResponse> getHistoryForApprover(String approverId) {
		if (approverId == null || approverId.isBlank())
			return List.of();
		// Use a set to deduplicate (a ticket could appear in both L1 and L2 history
		// if the same person is both approvers — unlikely but possible)
		java.util.Set<Long> seen = new java.util.HashSet<>();
		return approvalRepository.findAllHistoryForApprover(approverId).stream().filter(t -> seen.add(t.getTicketId()))
				.sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt())).map(approvalMapper::toResponse)
				.collect(java.util.stream.Collectors.toList());
	}

	// ═══════════════════════════════════════════════════════════════════════
	// MASTER-SERVICE — project + user lookup
	// ═══════════════════════════════════════════════════════════════════════
	@SuppressWarnings("unchecked")
	private ProjectManagers fetchProjectManagers(Long projectId) {
		if (projectId == null) {
			log.warn("projectId is null — approver details will use fallback values from request");
			return new ProjectManagers(null, null, null);
		}
		try {
			Map<String, Object> body = masterDataClient.getProjectById(projectId);
			if (body != null && body.get(KEY_DATA) instanceof Map<?, ?> dataRaw) {
				Map<String, Object> data = (Map<String, Object>) dataRaw;
				return new ProjectManagers(toLong(data.get(KEY_L1_MGR)), toLong(data.get(KEY_L2_MGR)),
						toLong(data.get(KEY_RO)));
			}
		} catch (Exception ex) {
			log.warn("Could not fetch project {} from master-service: {}", projectId, ex.getMessage());
		}
		return new ProjectManagers(null, null, null);
	}

	@SuppressWarnings("unchecked")
	private UserDetail fetchUserDetail(Long userId) {
		if (userId == null)
			return UserDetail.empty();
		try {
			Map<String, Object> body = masterDataClient.getUserById(userId);
			if (body != null && body.get(KEY_DATA) instanceof Map<?, ?> dataRaw) {
				Map<String, Object> data = (Map<String, Object>) dataRaw;
				String email = getString(data, KEY_EMAIL);
				String firstName = getString(data, KEY_FIRST_NAME);
				String lastName = getString(data, KEY_LAST_NAME);
				String fullName = buildFullName(firstName, lastName);
				return new UserDetail(isBlank(email) ? null : email, isBlank(fullName) ? null : fullName);
			}
		} catch (Exception ex) {
			log.warn("Could not fetch user {} from master-service: {}", userId, ex.getMessage());
		}
		return UserDetail.empty();
	}

	// ═══════════════════════════════════════════════════════════════════════
	// DOWNSTREAM — assignment + SLA trigger
	// ═══════════════════════════════════════════════════════════════════════
	@SuppressWarnings("unchecked")
	private void triggerAssignmentAndSla(Long ticketId) {

		String priority = "MEDIUM";
		long slaMinutes = 1440L;
		try {
			Map<String, Object> body = ticketClient.getTicketById(ticketId);
			if (body != null && body.get(KEY_DATA) instanceof Map<?, ?> dataRaw) {
				Map<String, Object> data = (Map<String, Object>) dataRaw;
				// Try 'priority' field first (stored as string e.g. "HIGH")
				String p = getString(data, KEY_PRIORITY);
				// Also try 'priorityName' in case the ticket response uses that field
				if (isBlank(p) && data.get("priority") instanceof Map) {
					@SuppressWarnings("unchecked")
					Map<String, Object> priorityObj = (Map<String, Object>) data.get("priority");
					Object name = priorityObj.get("name");
					if (name != null)
						p = name.toString();
				}
				if (isBlank(p))
					p = getString(data, "priorityName");
				if (!isBlank(p)) {
					priority = p.toUpperCase();
					log.info("Ticket #{} priority resolved to: {}", ticketId, priority);
				} else {
					log.warn("Ticket #{} priority field is blank, defaulting to MEDIUM", ticketId);
				}
			}
		} catch (Exception ex) {
			log.warn("Could not fetch ticket priority for ticketId={}: {}", ticketId, ex.getMessage());
		}
		switch (priority) {
		case "CRITICAL" -> slaMinutes = 240L;
		case "HIGH" -> slaMinutes = 480L;
		case "LOW" -> slaMinutes = 2880L;
		default -> slaMinutes = 1440L;
		}
		try {
			AssignmentTriggerRequest aReq = new AssignmentTriggerRequest(ticketId, priority, 1.0, 1.0);
			assignmentClient.triggerAssignment(aReq);
			log.info("Assignment triggered | ticketId={} priority={}", ticketId, priority);
		} catch (Exception ex) {
			log.warn("Assignment trigger failed for ticketId={}: {}", ticketId, ex.getMessage());
		}
		try {
			Map<String, Object> slaReq = new HashMap<>();
			slaReq.put(KEY_TICKET_ID, ticketId);
			slaReq.put(KEY_SLA_MIN, slaMinutes);
			slaClient.startSla(slaReq);
			log.info("SLA started | ticketId={} slaMinutes={}", ticketId, slaMinutes);
		} catch (Exception ex) {
			log.warn("SLA start failed for ticketId={}: {}", ticketId, ex.getMessage());
		}
	}

	// ═══════════════════════════════════════════════════════════════════════
	// EMAIL BODY BUILDERS
	// ═══════════════════════════════════════════════════════════════════════
	private void sendL1RequestEmail(TicketApproval approval, String ticketSubject, String requesterName) {
		String body = "Dear " + approval.getL1ApproverName() + ",\n\n"
				+ "A new service desk ticket has been submitted and requires your approval.\n\n"
				+ "──────────────────────────────────\n" + "Ticket Number : #" + approval.getTicketId() + "\n"
				+ "Subject       : " + ticketSubject + "\n" + "Requested By  : " + requesterName + "\n"
				+ "Approval Stage: L1 — Initial Review\n" + "──────────────────────────────────\n\n"
				+ "Please log in to ServiceEverz and take action on this ticket.\n\n" + "Regards,\n"
				+ "ServiceEverz System";
		sendEmailSafe(approval.getL1ApproverEmail(), "Action Required: L1 Approval - Ticket #" + approval.getTicketId(),
				body);
	}

	private String buildL2RequestEmailBody(String l2Name, Long ticketId, String l1Name) {
		return "Dear " + l2Name + ",\n\n" + "Ticket #" + ticketId + " has been reviewed and approved by L1 approver "
				+ l1Name + ".\n\n" + "It now requires your L2 approval to proceed to the support team.\n\n"
				+ "Please log in to ServiceEverz and take action on this ticket.\n\n" + "Regards,\nServiceEverz System";
	}

	private String buildResourceOwnerRequestEmailBody(String roName, Long ticketId, String l1Name, String l2Name) {
		return "Dear " + roName + ",\n\n" + "Ticket #" + ticketId + " has been approved by:\n" + "  - L1 Approver: "
				+ l1Name + "\n" + "  - L2 Approver: " + l2Name + "\n\n"
				+ "This ticket includes a request for access to a non-listed resource.\n"
				+ "As the Resource Owner, your approval is required.\n\n"
				+ "Please log in to ServiceEverz and take action on this ticket.\n\n" + "Regards,\nServiceEverz System";
	}

	private String buildRejectionEmailBody(String level, String approverName, Long ticketId, String remarks) {
		String reason = (!isBlank(remarks)) ? remarks : "No reason provided";
		return "Dear Requester,\n\n" + "We regret to inform you that your service desk ticket has been rejected.\n\n"
				+ "──────────────────────────────────\n" + "Ticket Number  : #" + ticketId + "\n" + "Rejected At    : "
				+ level + " Approval Stage\n" + "Rejected By    : " + approverName + "\n" + "Reason         : " + reason
				+ "\n" + "──────────────────────────────────\n\n"
				+ "If you believe this decision was made in error, please raise a new ticket.\n\n"
				+ "Regards,\nServiceEverz System";
	}

	private String buildProgressEmailBody(Long ticketId, String completedLevel, String approverName, String nextStage) {
		return "Dear Requester,\n\n" + "Your service desk ticket is progressing through the approval workflow.\n\n"
				+ "──────────────────────────────────\n" + "Ticket Number  : #" + ticketId + "\n" + "Completed Stage: "
				+ completedLevel + " — Approved by " + approverName + "\n" + "Next Stage     : " + nextStage + "\n"
				+ "──────────────────────────────────\n\n"
				+ "You will be notified once the next approver takes action.\n\n" + "Regards,\nServiceEverz System";
	}

	private String buildFullyApprovedEmailBody(Long ticketId, String lastApproverName) {
		return "Dear Requester,\n\n" + "Great news! Your service desk ticket has been fully approved.\n\n"
				+ "──────────────────────────────────\n" + "Ticket Number  : #" + ticketId + "\n" + "Final Approver : "
				+ lastApproverName + "\n" + "Status         : Fully Approved\n"
				+ "──────────────────────────────────\n\n"
				+ "Your ticket is now being assigned to a support engineer.\n\n" + "Regards,\nServiceEverz System";
	}

	// ═══════════════════════════════════════════════════════════════════════
	// UTILITY
	// ═══════════════════════════════════════════════════════════════════════
	private void sendEmailSafe(String to, String subject, String body) {
		if (isBlank(to)) {
			log.warn("Skipping email — recipient is blank. Subject: {}", subject);
			return;
		}
		try {
			mailClient.sendEmail(new EmailRequest(to, subject, body, false));
			log.info("Email dispatched | to='{}' subject='{}'", to, subject);
		} catch (Exception ex) {
			log.warn("Email dispatch failed | to='{}' reason: {}", to, ex.getMessage());
		}
	}

	private String resolveValue(String primary, String fallback) {
		return (!isBlank(primary)) ? primary : fallback;
	}

	private Long toLong(Object value) {
		if (value == null)
			return null;
		if (value instanceof Number n)
			return n.longValue();
		try {
			return Long.parseLong(value.toString());
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private String getString(Map<String, Object> map, String key) {
		Object val = map.get(key);
		return (val instanceof String s) ? s : null;
	}

	private String buildFullName(String firstName, String lastName) {
		String fn = firstName != null ? firstName.trim() : "";
		String ln = lastName != null ? lastName.trim() : "";
		return (fn + " " + ln).trim();
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}

	// ═══════════════════════════════════════════════════════════════════════
	// PRIVATE VALUE OBJECTS
	// ═══════════════════════════════════════════════════════════════════════
	private static final class ProjectManagers {
		final Long l1ManagerId;
		final Long l2ManagerId;
		final Long resourceOwnerId;

		ProjectManagers(Long l1ManagerId, Long l2ManagerId, Long resourceOwnerId) {
			this.l1ManagerId = l1ManagerId;
			this.l2ManagerId = l2ManagerId;
			this.resourceOwnerId = resourceOwnerId;
		}
	}

	private static final class UserDetail {
		final String email;
		final String name;

		UserDetail(String email, String name) {
			this.email = email;
			this.name = name;
		}

		static UserDetail empty() {
			return new UserDetail(null, null);
		}
	}
}
