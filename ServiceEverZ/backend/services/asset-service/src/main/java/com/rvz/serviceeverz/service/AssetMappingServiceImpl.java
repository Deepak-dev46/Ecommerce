package com.rvz.serviceeverz.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rvz.serviceeverz.dto.request.AdditionalDetailsRequest;
import com.rvz.serviceeverz.dto.request.AssetMappingRequest;
import com.rvz.serviceeverz.dto.request.AssetReleaseRequest;
import com.rvz.serviceeverz.dto.request.ManagerDecisionRequest;
import com.rvz.serviceeverz.dto.request.SupportPersonnelDecisionRequest;
import com.rvz.serviceeverz.dto.response.AssetMappingResponse;
import com.rvz.serviceeverz.dto.response.TicketResponse;
import com.rvz.serviceeverz.dto.response.UserSummaryResponse;
import com.rvz.serviceeverz.entity.Asset;
import com.rvz.serviceeverz.entity.AssetMapping;
import com.rvz.serviceeverz.entity.AssetMappingHistory;
import com.rvz.serviceeverz.enums.AssetStatus;
import com.rvz.serviceeverz.enums.MappingStatus;
import com.rvz.serviceeverz.exceptions.AssetNotAvailableException;
import com.rvz.serviceeverz.exceptions.AssetNotFoundException;
import com.rvz.serviceeverz.feign.TicketFeignClient;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.notification.AssetNotificationService;
import com.rvz.serviceeverz.repository.AssetMappingHistoryRepository;
import com.rvz.serviceeverz.repository.AssetMappingRepository;
import com.rvz.serviceeverz.repository.AssetRepository;

@Service
public class AssetMappingServiceImpl implements AssetMappingService {

	private static final Logger log = LoggerFactory.getLogger(AssetMappingServiceImpl.class);

	private final AssetMappingRepository mappingRepo;
	private final AssetRepository assetRepo;
	private final AssetMappingHistoryRepository historyRepo;
	private final AssetNotificationService notifService;
	private final UserServiceClient userClient;
	private final TicketFeignClient ticketClient;

	public AssetMappingServiceImpl(AssetMappingRepository mappingRepo, AssetRepository assetRepo,
			AssetMappingHistoryRepository historyRepo, AssetNotificationService notifService,
			UserServiceClient userClient, TicketFeignClient ticketClient) {
		this.mappingRepo = mappingRepo;
		this.assetRepo = assetRepo;
		this.historyRepo = historyRepo;
		this.notifService = notifService;
		this.userClient = userClient;
		this.ticketClient = ticketClient;
	}

	// -------------------------------------------------------------------------
	// User-service helpers (unchanged)
	// -------------------------------------------------------------------------

	private UserSummaryResponse fetchUser(Long userId) {
		if (userId == null) return null;
		try {
			return userClient.getUserById(userId);
		} catch (Exception e) {
			log.warn("Failed to fetch user {} from user-service: {}", userId, e.getMessage());
			return null;
		}
	}

	private String resolveName(Long userId) {
		if (userId == null) return null;
		UserSummaryResponse user = fetchUser(userId);
		return user != null ? user.getFullName() : null;
	}

	// -------------------------------------------------------------------------
	// Ticket-service helpers (updated to use TicketResponse)
	// -------------------------------------------------------------------------

	/**
	 * Fetches a TicketResponse from ticket-service.
	 * Returns null when ticketId is null or the call fails.
	 */
	private TicketResponse fetchTicket(Long ticketId) {
		if (ticketId == null) return null;
		try {
			TicketResponse ticket = ticketClient.getTicketById(ticketId);
			if (ticket == null) {
				log.warn("Ticket not found in ticket-service for ticketId={}", ticketId);
			}
			return ticket;
		} catch (Exception e) {
			log.error("Failed to fetch ticket {} from ticket-service: {}", ticketId, e.getMessage());
			return null;
		}
	}

	/**
	 * Resolves the requesting user's ID from the ticket's requesterId field.
	 * Replaces the old Map-based approach that used "createdByUserId".
	 */
	private Long resolveUserIdFromTicket(Long ticketId) {
		if (ticketId == null) return null;
		TicketResponse ticket = fetchTicket(ticketId);
		if (ticket == null) return null;
		if (ticket.getRequesterId() == null) {
			log.warn("requesterId not present in TicketResponse for ticketId={}", ticketId);
			return null;
		}
		return ticket.getRequesterId();
	}

	// -------------------------------------------------------------------------
	// Mapping → Response conversion
	// -------------------------------------------------------------------------

	private AssetMappingResponse toResponse(AssetMapping m) {
		AssetMappingResponse r = new AssetMappingResponse();

		// Core mapping fields
		r.setId(m.getId());
		r.setMappingNumber(m.getMappingNumber());

		// Asset fields
		r.setAssetId(m.getAsset().getId());
		r.setAssetTag(m.getAsset().getAssetTag());
		r.setAssetName(m.getAsset().getName());

		// Ticket link
		r.setTicketId(m.getTicketId());

		// Ticket-enriched fields — populated only when a ticketId exists
		if (m.getTicketId() != null) {
			TicketResponse ticket = fetchTicket(m.getTicketId());
			if (ticket != null) {
				r.setTicketNumber(ticket.getTicketNumber());
				r.setTicketSubject(ticket.getSubject());
				r.setTicketPriority(ticket.getPriority());
				r.setTicketStatus(ticket.getStatus());
				r.setRequesterLocation(ticket.getLocation());
				r.setRequesterMobile(ticket.getMobileNumber());
				r.setAccessRequiredTill(ticket.getAccessRequiredTill());
			}
		}

		// People — resolved via user-service
		r.setRequestedByUserId(m.getRequestedByUserId());
		r.setAssignedBySpId(m.getAssignedBySpId());
		r.setApprovedByManagerId(m.getApprovedByManagerId());
		r.setRequestedByUserName(resolveName(m.getRequestedByUserId()));
		r.setAssignedBySpName(resolveName(m.getAssignedBySpId()));
		r.setApprovedByManagerName(resolveName(m.getApprovedByManagerId()));

		// Workflow
		r.setStatus(m.getStatus());
		r.setSpRemarks(m.getSpRemarks());
		r.setManagerRemarks(m.getManagerRemarks());
		r.setAdditionalDetailsRequest(m.getAdditionalDetailsRequest());
		r.setAdditionalDetailsResponse(m.getAdditionalDetailsResponse());

		// Timestamps
		r.setSpApprovedAt(m.getSpApprovedAt());
		r.setManagerApprovedAt(m.getManagerApprovedAt());
		r.setAssignedFrom(m.getAssignedFrom());
		r.setAssignedTo(m.getAssignedTo());
		r.setCreatedAt(m.getCreatedAt());

		return r;
	}

	// -------------------------------------------------------------------------
	// History snapshot
	// -------------------------------------------------------------------------

	private void snapshot(AssetMapping m, String label) {
		AssetMappingHistory h = new AssetMappingHistory();
		h.setMappingId(m.getId());
		h.setAssetId(m.getAsset().getId());
		h.setAssetTag(m.getAsset().getAssetTag());
		h.setUserId(m.getRequestedByUserId());
		h.setAssignedBySpId(m.getAssignedBySpId());
		h.setApprovedByManagerId(m.getApprovedByManagerId());
		h.setTicketId(m.getTicketId());
		h.setAssignedFrom(m.getAssignedFrom());
		h.setAssignedTo(m.getAssignedTo());
		h.setStatusAtClose(label);
		h.setSpRemarks(m.getSpRemarks());
		h.setManagerRemarks(m.getManagerRemarks());
		historyRepo.save(h);
	}

	// -------------------------------------------------------------------------
	// Service operations (logic unchanged — only ticket lookup updated above)
	// -------------------------------------------------------------------------

	@Override
	@Transactional
	public AssetMappingResponse createMapping(AssetMappingRequest req) {
		Asset asset = assetRepo.findById(req.getAssetId()).filter(a -> Boolean.FALSE.equals(a.getIsDeleted()))
				.orElseThrow(() -> new AssetNotFoundException("Asset not found: " + req.getAssetId()));
		if (asset.getStatus() != AssetStatus.AVAILABLE) {
			throw new AssetNotAvailableException("Asset '" + asset.getName() + "' is " + asset.getStatus());
		}
		if (mappingRepo.existsByAsset_IdAndStatusIn(asset.getId(), List.of(MappingStatus.PENDING_SP_APPROVAL,
				MappingStatus.PENDING_MANAGER_APPROVAL, MappingStatus.ACTIVE))) {
			throw new AssetNotAvailableException("Asset already has an active or pending mapping.");
		}

		Long requestedByUserId = req.getRequestedByUserId();
		if (requestedByUserId == null && req.getTicketId() != null) {
			requestedByUserId = resolveUserIdFromTicket(req.getTicketId());
			if (requestedByUserId == null) {
				throw new IllegalStateException(
						"Could not resolve requestedByUserId: neither provided directly nor found via ticketId="
								+ req.getTicketId() + " in ticket-service.");
			}
			log.info("Resolved requestedByUserId={} from ticketId={}", requestedByUserId, req.getTicketId());
		}
		if (requestedByUserId == null) {
			throw new IllegalStateException("requestedByUserId is required (or provide a ticketId to look it up).");
		}

		AssetMapping m = new AssetMapping();
		m.setMappingNumber("AM-TEMP-" + System.nanoTime());
		m.setAsset(asset);
		m.setTicketId(req.getTicketId());
		m.setRequestedByUserId(requestedByUserId);
		m.setAssignedBySpId(req.getAssignedBySpId());
		m.setSpRemarks(req.getSpRemarks());
		m.setStatus(MappingStatus.PENDING_SP_APPROVAL);
		m = mappingRepo.save(m);
		m.setMappingNumber(String.format("AM-%06d", m.getId()));
		m = mappingRepo.save(m);
		notifService.notifySpMappingRequestReceived(m);
		return toResponse(m);
	}

	@Override
	@Transactional
	public AssetMappingResponse spDecision(Long mappingId, SupportPersonnelDecisionRequest req) {
		AssetMapping m = mappingRepo.findById(mappingId)
				.orElseThrow(() -> new AssetNotFoundException("Mapping not found: " + mappingId));
		if (m.getStatus() != MappingStatus.PENDING_SP_APPROVAL
				&& m.getStatus() != MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_SP) {
			throw new IllegalStateException("Mapping not in SP-decision state. Current: " + m.getStatus());
		}

		switch (req.getDecision().toUpperCase()) {
		case "APPROVE" -> {
			m.setStatus(MappingStatus.PENDING_MANAGER_APPROVAL);
			m.setSpRemarks(req.getRemarks());
			m.setSpApprovedAt(LocalDateTime.now());
			m = mappingRepo.save(m);
			notifService.notifyManagerApprovalRequired(m);
		}
		case "REJECT" -> {
			if (req.getRemarks() == null || req.getRemarks().isBlank()) {
				throw new IllegalStateException("Rejection reason is required.");
			}
			m.setStatus(MappingStatus.REJECTED_BY_SP);
			m.setSpRemarks(req.getRemarks());
			m = mappingRepo.save(m);
			snapshot(m, "REJECTED_BY_SP");
			notifService.notifyUserAssetRejectedBySp(m);
		}
		case "REQUEST_ADDITIONAL_DETAILS" -> {
			if (req.getAdditionalDetailsRequest() == null || req.getAdditionalDetailsRequest().isBlank()) {
				throw new IllegalStateException("Details request message is required.");
			}
			m.setStatus(MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_SP);
			m.setAdditionalDetailsRequest(req.getAdditionalDetailsRequest());
			m.setSpRemarks(req.getRemarks());
			m = mappingRepo.save(m);
			notifService.notifyUserAdditionalDetailsRequiredBySp(m);
		}
		default -> throw new IllegalStateException("Invalid decision: " + req.getDecision());
		}
		return toResponse(m);
	}

	@Override
	@Transactional
	public AssetMappingResponse managerDecision(Long mappingId, ManagerDecisionRequest req) {
		AssetMapping m = mappingRepo.findById(mappingId)
				.orElseThrow(() -> new AssetNotFoundException("Mapping not found: " + mappingId));
		if (m.getStatus() != MappingStatus.PENDING_MANAGER_APPROVAL
				&& m.getStatus() != MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_MANAGER) {
			throw new IllegalStateException("Mapping not in manager-decision state. Current: " + m.getStatus());
		}
		m.setApprovedByManagerId(req.getManagerId());

		switch (req.getDecision().toUpperCase()) {
		case "APPROVE" -> {
			m.setStatus(MappingStatus.ACTIVE);
			m.setManagerRemarks(req.getRemarks());
			m.setManagerApprovedAt(LocalDateTime.now());
			m.setAssignedFrom(LocalDateTime.now());
			Asset asset = m.getAsset();
			asset.setStatus(AssetStatus.ASSIGNED);
			asset.setAssignedToUserId(m.getRequestedByUserId());
			assetRepo.save(asset);
			m = mappingRepo.save(m);
			snapshot(m, "ACTIVE");
			notifService.notifySpManagerApproved(m);
			notifService.notifyUserAssetApproved(m);
		}
		case "REJECT" -> {
			if (req.getRemarks() == null || req.getRemarks().isBlank()) {
				throw new IllegalStateException("Rejection reason is required.");
			}
			m.setStatus(MappingStatus.REJECTED_BY_MANAGER);
			m.setManagerRemarks(req.getRemarks());
			m = mappingRepo.save(m);
			snapshot(m, "REJECTED_BY_MANAGER");
			notifService.notifySpManagerRejected(m);
			notifService.notifyUserAssetRejectedByManager(m);
		}
		case "REQUEST_ADDITIONAL_DETAILS" -> {
			if (req.getAdditionalDetailsRequest() == null || req.getAdditionalDetailsRequest().isBlank()) {
				throw new IllegalStateException("Details request message is required.");
			}
			m.setStatus(MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_MANAGER);
			m.setAdditionalDetailsRequest(req.getAdditionalDetailsRequest());
			m.setManagerRemarks(req.getRemarks());
			m = mappingRepo.save(m);
			notifService.notifySpManagerRequestsAdditionalDetails(m);
		}
		default -> throw new IllegalStateException("Invalid decision: " + req.getDecision());
		}
		return toResponse(m);
	}

	@Override
	@Transactional
	public AssetMappingResponse submitAdditionalDetails(Long mappingId, AdditionalDetailsRequest req) {
		AssetMapping m = mappingRepo.findById(mappingId)
				.orElseThrow(() -> new AssetNotFoundException("Mapping not found: " + mappingId));
		if (m.getStatus() != MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_SP
				&& m.getStatus() != MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_MANAGER) {
			throw new IllegalStateException("No additional details pending for this mapping.");
		}
		if (!m.getRequestedByUserId().equals(req.getUserId())) {
			throw new IllegalStateException("Only the requesting user can submit additional details.");
		}
		m.setAdditionalDetailsResponse(req.getDetails());
		m.setStatus(
				m.getStatus() == MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_SP ? MappingStatus.PENDING_SP_APPROVAL
						: MappingStatus.PENDING_MANAGER_APPROVAL);
		return toResponse(mappingRepo.save(m));
	}

	@Override
	@Transactional
	public AssetMappingResponse releaseAsset(Long mappingId, AssetReleaseRequest req) {
		AssetMapping m = mappingRepo.findById(mappingId)
				.orElseThrow(() -> new AssetNotFoundException("Mapping not found: " + mappingId));
		if (m.getStatus() != MappingStatus.ACTIVE) {
			throw new IllegalStateException("Only ACTIVE mappings can be released.");
		}
		m.setStatus(MappingStatus.RELEASED);
		m.setAssignedTo(LocalDateTime.now());
		if (req.getRemarks() != null && !req.getRemarks().isBlank()) {
			m.setSpRemarks(req.getRemarks());
		}
		m = mappingRepo.save(m);
		Asset asset = m.getAsset();
		asset.setStatus(AssetStatus.AVAILABLE);
		asset.setAssignedToUserId(null);
		assetRepo.save(asset);
		snapshot(m, "RELEASED");
		return toResponse(m);
	}

	@Override
	public AssetMappingResponse getMappingById(Long id) {
		AssetMapping m = mappingRepo.findById(id)
				.orElseThrow(() -> new AssetNotFoundException("Mapping not found: " + id));
		return toResponse(m);
	}

	@Override
	public List<AssetMappingResponse> getAllMappings() {
		return mappingRepo.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetMappingResponse> getMappingsByUser(Long userId) {
		return mappingRepo.findAllByRequestedByUserId(userId).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetMappingResponse> getMappingsBySp(Long spId) {
		return mappingRepo.findAllByAssignedBySpId(spId).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetMappingResponse> getMappingsByAsset(Long assetId) {
		return mappingRepo.findAllByAsset_IdOrderByCreatedAtDesc(assetId).stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetMappingResponse> getPendingSpApprovals() {
		return mappingRepo
				.findAllByStatusIn(
						List.of(MappingStatus.PENDING_SP_APPROVAL, MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_SP))
				.stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetMappingResponse> getPendingManagerApprovals() {
		return mappingRepo
				.findAllByStatusIn(List.of(MappingStatus.PENDING_MANAGER_APPROVAL,
						MappingStatus.ADDITIONAL_DETAILS_REQUESTED_BY_MANAGER))
				.stream().map(this::toResponse).toList();
	}

	@Override
	public List<AssetMappingHistory> getHistoryByAsset(Long assetId) {
		return historyRepo.findAllByAssetIdOrderByAssignedFromDesc(assetId);
	}

	@Override
	public List<AssetMappingHistory> getHistoryByUser(Long userId) {
		return historyRepo.findAllByUserIdOrderByAssignedFromDesc(userId);
	}
}
