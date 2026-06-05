
package com.relevantz.ticketservice.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.relevantz.ticketservice.dto.AddCommentRequest;
import com.relevantz.ticketservice.dto.ApprovalResponse;
import com.relevantz.ticketservice.dto.CancelTicketRequest;
import com.relevantz.ticketservice.dto.CommentResponse;
import com.relevantz.ticketservice.dto.CreateTicketRequest;
import com.relevantz.ticketservice.dto.HistoryResponse;
import com.relevantz.ticketservice.dto.ReopenTicketRequest;
import com.relevantz.ticketservice.dto.SlaResponse;
import com.relevantz.ticketservice.dto.TicketResponse;
import com.relevantz.ticketservice.dto.UpdateTicketStatusRequest;
import com.relevantz.ticketservice.exception.BadRequestException;
import com.relevantz.ticketservice.exception.ResourceNotFoundException;
import com.relevantz.ticketservice.model.Priority;
import com.relevantz.ticketservice.model.Ticket;
import com.relevantz.ticketservice.model.TicketAttachments;
import com.relevantz.ticketservice.model.TicketComment;
import com.relevantz.ticketservice.model.TicketHistory;
import com.relevantz.ticketservice.model.TicketItemTimePeriod;
import com.relevantz.ticketservice.model.TicketQueue;
import com.relevantz.ticketservice.model.TicketStatus;
import com.relevantz.ticketservice.repository.TicketAccessPeriodRepository;
import com.relevantz.ticketservice.repository.TicketAttachmentRepository;
import com.relevantz.ticketservice.repository.TicketCommentRepository;
import com.relevantz.ticketservice.repository.TicketHistoryRepository;
import com.relevantz.ticketservice.repository.TicketItemTimePeriodRepository;
import com.relevantz.ticketservice.repository.TicketQueueRepository;
import com.relevantz.ticketservice.repository.TicketRepository;

@Service
@Transactional
public class TicketService {

	private final TicketRepository ticketRepository;
	private final TicketCommentRepository commentRepository;
	private final TicketHistoryRepository historyRepository;
	private final TicketAttachmentRepository attachmentRepository;
	private final TicketQueueRepository queueRepository;
	private final TicketItemTimePeriodRepository timePeriodRepository;
	private final com.relevantz.ticketservice.client.ApprovalClient approvalClient;
	private final TicketRelationshipService relationshipService;
    private final TicketAccessPeriodRepository accessPeriodRepo;


	@Value("${sla.hours.LOW:72}")
	private int slaLow;
	@Value("${sla.hours.MEDIUM:24}")
	private int slaMedium;
	@Value("${sla.hours.HIGH:8}")
	private int slaHigh;
	@Value("${sla.hours.CRITICAL:4}")
	private int slaCritical;

	private final AtomicLong ticketSeq = new AtomicLong(System.currentTimeMillis() % 10000);

	public TicketService(TicketRepository ticketRepository, TicketCommentRepository commentRepository,
			TicketHistoryRepository historyRepository, TicketAttachmentRepository attachmentRepository,
			TicketQueueRepository queueRepository, TicketItemTimePeriodRepository timePeriodRepository,
			com.relevantz.ticketservice.client.ApprovalClient approvalClient,
			TicketRelationshipService relationshipService, TicketAccessPeriodRepository accessPeriodRepo) {
		this.ticketRepository = ticketRepository;
		this.commentRepository = commentRepository;
		this.historyRepository = historyRepository;
		this.attachmentRepository = attachmentRepository;
		this.queueRepository = queueRepository;
		this.timePeriodRepository = timePeriodRepository;
		this.approvalClient = approvalClient;
		this.relationshipService = relationshipService;
	    this.accessPeriodRepo = accessPeriodRepo;
	}

	/*
	 * ========================================================= CREATE TICKET
	 * =========================================================
	 */
	public TicketResponse createTicket(CreateTicketRequest req) {

		Ticket ticket = new Ticket();

		ticket.setTicketNumber(generateTicketNumber());
		ticket.setSubject(req.getSubject());
		ticket.setDescription(req.getDescription());
		ticket.setCategoryName(req.getCategory());

		// FIX 1 & 2: Use effective getters — resolves requestedById OR requesterId
		ticket.setUserId(req.getEffectiveRequesterId());
		ticket.setRequesterName(req.getEffectiveRequesterName());
		ticket.setPriority(req.getEffectivePriority());

		// FIX 2: Map all hierarchy IDs so the duplicate scorer can use them
		ticket.setCategoryId(req.getCategoryId() != null ? req.getCategoryId().longValue() : null);
		ticket.setSubCategoryId(req.getSubCategoryId() != null ? req.getSubCategoryId().longValue() : null);
		ticket.setItemId(req.getItemId() != null ? req.getItemId().longValue() : null);
		ticket.setAssetId(req.getAssetId());
		ticket.setLocation(req.getLocation());
		ticket.setProjectId(req.getProjectId());
		ticket.setTypeId(req.getTypeId());
		ticket.setTypeName(req.getTypeName());

		ticket.setStatus(TicketStatus.OPEN);

		LocalDateTime now = LocalDateTime.now();
		ticket.setSlaStartTime(now);
		ticket.setSlaDeadline(now.plusHours(slaHoursFor(req.getEffectivePriority())));
		ticket.setSlaBreached(false);

		Ticket saved = ticketRepository.save(ticket);
		try {
			relationshipService.runDuplicateDetection(saved);
		} catch (Exception e) {
			// FIX 3: Always log detection failures
			System.err.println("[WARN] Duplicate detection failed for ticket "
				+ saved.getTicketId() + ": " + e.getMessage());
		}

		recordHistory(saved, TicketStatus.OPEN, "Ticket created");

		return TicketResponse.from(saved, List.of(), List.of(), List.of(), List.of(), null);
	}

	/*
	 * ========================================================= GET TICKET DETAILS
	 * =========================================================
	 */
	public TicketResponse getTicketById(Long ticketId) {

		Ticket ticket = findTicketOrThrow(ticketId);

		List<TicketComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
		List<TicketAttachments> attachments = attachmentRepository.findByTicketId(ticketId);
		List<TicketQueue> queue = queueRepository.findByTicketId(ticketId);
		TicketItemTimePeriod timePeriod = timePeriodRepository.findByTicketId(ticketId);

		// FIXED: fetch real approval status from ticket_approvals via approval-service
		ApprovalResponse approvalResponse = null;
		try {
			java.util.Map<String, Object> apiResp = approvalClient.getApprovalByTicket(ticketId);
			approvalResponse = ApprovalResponse.fromMap(apiResp);
		} catch (Exception e) {
			// approval-service may not have a record yet (draft tickets) — safe to ignore
			System.out.println("No approval record for ticket " + ticketId + ": " + e.getMessage());
		}
		TicketResponse response = TicketResponse.from(ticket, attachments, comments, queue, List.of(), timePeriod, approvalResponse);
 
        accessPeriodRepo.findByTicketId(ticketId)
        .ifPresent(ap -> response.setAccessRequiredTill(ap.getAccessRequiredTill()));
        return response;
	}

	public List<TicketResponse> getDraftsByUser(Long userId) {
		return ticketRepository.findByUserIdAndDraftTrueOrderByUpdatedAtDesc(userId).stream()
				.map(ticket -> TicketResponse.from(ticket, List.of(), List.of(), List.of(), List.of(), null)).toList();
	}

	/*
	 * ========================================================= COMMENTS
	 * =========================================================
	 */
	public CommentResponse addComment(Long ticketId, AddCommentRequest req) {

		 Ticket ticket=findTicketOrThrow(ticketId);
		
		if ("END_USER".equalsIgnoreCase(req.getAuthorRole())
	            && !ticket.isAllowUserReply()) {
	 
	        throw new BadRequestException(
	                "User replies are disabled for this ticket"
	        );
	    }

		TicketComment comment = new TicketComment();
		comment.setTicketId(ticketId);
		comment.setUserId(req.getAuthorId());
		comment.setComment(req.getBody());
		comment.setCreatedBy(req.getAuthorId());
		comment.setAuthorName(req.getAuthorName());
		System.out.println(req.getAuthorName());
		comment.setAuthorRole(req.getAuthorRole());
		System.out.println(req.getAuthorRole());
		comment.setChannel(req.getChannel());
		return CommentResponse.from(commentRepository.save(comment));
	}

	public List<CommentResponse> getCommentsByChannel(Long ticketId, String channel) {
	    return commentRepository
	            .findByTicketIdAndChannelOrderByCreatedAtAsc(ticketId, channel)
	            .stream()
	            .map(CommentResponse::from)
	            .toList();
	}
	 
	public List<CommentResponse> getComments(Long ticketId) {
		return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream().map(CommentResponse::from)
				.toList();
	}

	/*
	 * ========================================================= HISTORY
	 * =========================================================
	 */
	public List<HistoryResponse> getHistory(Long ticketId) {
		return historyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream().map(HistoryResponse::from)
				.toList();
	}

	/*
	 * ========================================================= UPDATE STATUS
	 * =========================================================
	 */
	public TicketResponse updateTicketStatus(Long id, UpdateTicketStatusRequest req) {

		Ticket ticket = findTicketOrThrow(id);

		if (ticket.getStatus() == TicketStatus.CLOSED) {
			throw new BadRequestException("Closed ticket cannot be updated");
		}

		TicketStatus next = req.getStatus();
		ticket.setStatus(next);

		LocalDateTime now = LocalDateTime.now();

		// ✅ FIX 1: Safe response time calculation
		if (next == TicketStatus.IN_PROGRESS && ticket.getResponseTimeMinutes() == null) {

			if (ticket.getSlaStartTime() != null) {
				long min = java.time.Duration.between(ticket.getSlaStartTime(), now).toMinutes();

				ticket.setResponseTimeMinutes(min);
			} else {
				System.out.println("⚠ SLA Start Time NULL (IN_PROGRESS) for ticket: " + ticket.getTicketId());
			}
		}

		// ✅ FIX 2: Safe resolution time calculation (CLOSE / RESOLVE)
		if (next == TicketStatus.RESOLVED || next == TicketStatus.CLOSED) {

			ticket.setResolutionNotes(req.getResolutionNotes());

			if (ticket.getSlaStartTime() != null) {
				long min = java.time.Duration.between(ticket.getSlaStartTime(), now).toMinutes();

				ticket.setResolutionTimeMinutes(min);
				
			} else {
				System.out.println("⚠ SLA Start Time NULL (CLOSED/RESOLVED) for ticket: " + ticket.getTicketId());
			}
		}

		// ✅ SLA breach check
		if (ticket.getSlaDeadline() != null && now.isAfter(ticket.getSlaDeadline())) {
			ticket.setSlaBreached(true);
		}

		Ticket saved = ticketRepository.save(ticket);

		recordHistory(saved, next, "Status changed to " + next, req.getChangedById(), req.getChangedBy());
		if (next == TicketStatus.RESOLVED || next == TicketStatus.CLOSED) {
            relationshipService.propagateDependencyResolution(saved.getTicketId());
            relationshipService.autoCloseParentIfAllChildrenResolved(saved.getTicketId());
        }
		return TicketResponse.from(saved, List.of(), List.of(), List.of(), List.of(), null);
	}

	/*
	 * ========================================================= REOPEN TICKET (✅
	 * FIXED) =========================================================
	 */
	public TicketResponse reopenTicket(Long id, ReopenTicketRequest req) {

		Ticket t = findTicketOrThrow(id);
		
// Guard: CLOSED tickets are final and can never be reopened
		if (t.getStatus() == TicketStatus.CLOSED) {
			throw new BadRequestException("Ticket is CLOSED and cannot be reopened.");
		}

		if (t.getStatus() != TicketStatus.RESOLVED) {
			throw new BadRequestException("Only resolved tickets can reopen");
		}

		t.setStatus(TicketStatus.REOPENED);

		LocalDateTime now = LocalDateTime.now();
		t.setSlaStartTime(now);
		t.setSlaDeadline(now.plusHours(slaHoursFor(t.getPriority())));
		t.setSlaBreached(false);

		Ticket saved = ticketRepository.save(t);

		recordHistory(saved, TicketStatus.REOPENED, req.getReason(), req.getRequestedById(), req.getRequestedBy());

		return TicketResponse.from(saved, List.of(), List.of(), List.of(), List.of(), null);
	}

	/*
	 * ========================================================= ASSIGN
	 * =========================================================
	 */
	public TicketResponse assignTicket(Long id, Long assigneeId, String name) {

		Ticket ticket = findTicketOrThrow(id);

		ticket.setAssigneeId(assigneeId);
		ticket.setAssigneeName(name);

		if (ticket.getStatus() == TicketStatus.OPEN) {
			ticket.setStatus(TicketStatus.IN_PROGRESS);
		}

		return TicketResponse.from(ticketRepository.save(ticket), List.of(), List.of(), List.of(), List.of(), null);
	}

	/*
	 * ========================================================= SLA
	 * =========================================================
	 */
	public SlaResponse getTicketSla(Long id) {
		try {
			Ticket t = findTicketOrThrow(id);

			long seconds = java.time.Duration.between(LocalDateTime.now(), t.getSlaDeadline()).getSeconds();

			return new SlaResponse(t.getPriority().name(), t.getSlaDeadline(), seconds, seconds < 0);
		} catch (Exception e) {
			System.out.println(e.getMessage());
			return null;
		}
	}

	/*
	 * ========================================================= HELPERS
	 * =========================================================
	 */
	private Ticket findTicketOrThrow(Long id) {
		return ticketRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
	}

	private int slaHoursFor(Priority p) {
		return switch (p) {
		case LOW -> slaLow;
		case MEDIUM -> slaMedium;
		case HIGH -> slaHigh;
		};
	}

	private String generateTicketNumber() {
		return String.format("TKT-%s-%04d", LocalDateTime.now().getYear(), ticketSeq.incrementAndGet() % 10000);
	}

	/*
	 * ========================================================= ✅ HISTORY METHODS
	 * (FIXED) =========================================================
	 */

	private void recordHistory(Ticket t, TicketStatus status, String msg, Long userId, String userName) {
		TicketHistory h = new TicketHistory();

		h.setTicketId(t.getTicketId());
		h.setStatus(status);
		h.setRemarks(msg);

		h.setChangedBy(userId != null ? userId : 0L);
		h.setChangedByName(userName != null ? userName : "System");

		historyRepository.save(h);
	}

	// ✅ Backward compatibility
	private void recordHistory(Ticket t, TicketStatus status, String msg) {
		recordHistory(t, status, msg, 0L, "System");
	}

	public TicketResponse pauseTicket(Long id, UpdateTicketStatusRequest req) {

		Ticket t = findTicketOrThrow(id);

		if (Boolean.TRUE.equals(t.getSlaPaused())) {
			throw new BadRequestException("Ticket SLA is already paused");
		}

		t.setSlaPaused(true);
		t.setSlaPauseTime(LocalDateTime.now());
		t.setStatus(TicketStatus.ON_HOLD);

		Ticket saved = ticketRepository.save(t);

		// ✅ Add user tracking
		recordHistory(saved, saved.getStatus(), "SLA paused", req.getChangedById(), req.getChangedBy());

		return TicketResponse.from(saved, List.of(), List.of(), List.of(), List.of(), null);
	}

	public TicketResponse resumeTicket(Long id, UpdateTicketStatusRequest req) {

		Ticket t = findTicketOrThrow(id);

		if (!Boolean.TRUE.equals(t.getSlaPaused())) {
			throw new BadRequestException("Ticket SLA is not paused");
		}

		LocalDateTime now = LocalDateTime.now();

		// ✅ CALCULATE PAUSED DURATION
		long pausedSeconds = java.time.Duration.between(t.getSlaPauseTime(), now).getSeconds();

		// ✅ ADD paused duration to deadline
		if (t.getSlaDeadline() != null) {
			t.setSlaDeadline(t.getSlaDeadline().plusSeconds(pausedSeconds));
		}

		t.setSlaPaused(false);
		t.setSlaResumeTime(now);
		t.setStatus(TicketStatus.IN_PROGRESS);

		Ticket saved = ticketRepository.save(t);

		recordHistory(saved, saved.getStatus(), "SLA resumed", req.getChangedById(), req.getChangedBy());

		return TicketResponse.from(saved, List.of(), List.of(), List.of(), List.of(), null);
	}

	/*
	 * ========================================================= GET ALL TICKETS ✅
	 * (MISSING - ADD THIS)
	 * =========================================================
	 */
	public List<TicketResponse> getAllTickets() {

		List<Ticket> tickets = ticketRepository.findAll();

		List<TicketResponse> response = new ArrayList<>();

		for (Ticket ticket : tickets) {

			List<TicketComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getTicketId());

			List<TicketAttachments> attachments = attachmentRepository.findByTicketId(ticket.getTicketId());

			List<TicketQueue> queue = queueRepository.findByTicketId(ticket.getTicketId());

			TicketItemTimePeriod timePeriod = timePeriodRepository.findByTicketId(ticket.getTicketId());

			response.add(TicketResponse.from(ticket, attachments, comments, queue, queue, // approvals
					timePeriod));
		}

		return response;
	}

	/*
	 * ========================================================= MY TICKETS ✅
	 * =========================================================
	 */
	@Transactional(readOnly = true)
	public List<TicketResponse> getMyTickets(Long userId) {

		return ticketRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
				.map(ticket -> TicketResponse.from(ticket, List.of(), // attachments not needed
						List.of(), // comments
						List.of(), // queue
						List.of(), // approvals
						null))
				.toList();
	}

	/*
	 * ========================================================= ASSIGNED TICKETS ✅
	 * =========================================================
	 */
	@Transactional(readOnly = true)
	public List<TicketResponse> getAssignedTickets(Long assigneeId) {

		return ticketRepository.findByAssigneeIdOrderByUpdatedAtDesc(assigneeId).stream()
				.map(ticket -> TicketResponse.from(ticket, List.of(), // attachments
						List.of(), // comments
						List.of(), // queue
						List.of(), // approvals
						null))
				.toList();
	}

	public String getNameByAssigneeId(long id) {
		return ticketRepository.getAssigneeName(id);
	}

	/*
	 * ========================================================= CANCEL TICKET (End
	 * user can cancel only OPEN tickets)
	 * =========================================================
	 */
	public TicketResponse cancelTicket(Long id, CancelTicketRequest req) {

		Ticket ticket = findTicketOrThrow(id);

		if (ticket.getStatus() != TicketStatus.OPEN) {
			throw new BadRequestException("Only tickets with status OPEN can be cancelled");
		}

		ticket.setStatus(TicketStatus.CANCELLED);
		ticket.setResolutionNotes(req.getReason());

		Ticket saved = ticketRepository.save(ticket);

		recordHistory(saved, TicketStatus.CANCELLED, "Ticket cancelled by user. Reason: " + req.getReason(),
				req.getCancelledById(), req.getCancelledBy());

		return TicketResponse.from(saved, List.of(), List.of(), List.of(), List.of(), null);
	}
	
	//toggle on 
	public boolean updateAllowUserReply(Long id, Boolean allow) {
		 
	    Ticket ticket = findTicketOrThrow(id);
	 
	    ticket.setAllowUserReply(allow);
	 
	    ticketRepository.save(ticket);
	 
	    return ticket.isAllowUserReply();
	}

	public boolean allowUserReply(Long id) {
		Ticket ticket = findTicketOrThrow(id);

		return ticket.isAllowUserReply();
	}
}