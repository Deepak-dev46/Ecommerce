package com.rvz.serviceeverz.dto.response;

import com.rvz.serviceeverz.enums.MappingStatus;
import java.time.LocalDateTime;

/**
 * Response DTO for AssetMapping.
 *
 * NEW fields (enriched from ticket-service via GET /api/tickets/{id}):
 * ticketNumber, ticketSubject, ticketPriority, ticketStatus, requesterLocation,
 * requesterMobile, accessRequiredTill
 */
public class AssetMappingResponse {

	// --- Core mapping fields ---
	private Long id;
	private String mappingNumber;

	// --- Asset ---
	private Long assetId;
	private String assetTag;
	private String assetName;

	// --- Ticket link ---
	private Long ticketId;

	// --- Ticket-enriched fields (populated when ticketId != null) ---
	private String ticketNumber;
	private String ticketSubject;
	private String ticketPriority;
	private String ticketStatus;
	private String requesterLocation; // ticket.location
	private String requesterMobile; // ticket.mobileNumber
	private LocalDateTime accessRequiredTill; // ticket.accessRequiredTill (new field)

	// --- People ---
	private Long requestedByUserId;
	private String requestedByUserName;
	private Long assignedBySpId;
	private String assignedBySpName;
	private Long approvedByManagerId;
	private String approvedByManagerName;

	// --- Workflow ---
	private MappingStatus status;
	private String spRemarks;
	private String managerRemarks;
	private String additionalDetailsRequest;
	private String additionalDetailsResponse;

	// --- Timestamps ---
	private LocalDateTime spApprovedAt;
	private LocalDateTime managerApprovedAt;
	private LocalDateTime assignedFrom;
	private LocalDateTime assignedTo;
	private LocalDateTime createdAt;

	// -------------------------------------------------------------------------
	// Getters & Setters
	// -------------------------------------------------------------------------

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getMappingNumber() {
		return mappingNumber;
	}

	public void setMappingNumber(String mappingNumber) {
		this.mappingNumber = mappingNumber;
	}

	public Long getAssetId() {
		return assetId;
	}

	public void setAssetId(Long assetId) {
		this.assetId = assetId;
	}

	public String getAssetTag() {
		return assetTag;
	}

	public void setAssetTag(String assetTag) {
		this.assetTag = assetTag;
	}

	public String getAssetName() {
		return assetName;
	}

	public void setAssetName(String assetName) {
		this.assetName = assetName;
	}

	public Long getTicketId() {
		return ticketId;
	}

	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}

	public String getTicketNumber() {
		return ticketNumber;
	}

	public void setTicketNumber(String ticketNumber) {
		this.ticketNumber = ticketNumber;
	}

	public String getTicketSubject() {
		return ticketSubject;
	}

	public void setTicketSubject(String ticketSubject) {
		this.ticketSubject = ticketSubject;
	}

	public String getTicketPriority() {
		return ticketPriority;
	}

	public void setTicketPriority(String ticketPriority) {
		this.ticketPriority = ticketPriority;
	}

	public String getTicketStatus() {
		return ticketStatus;
	}

	public void setTicketStatus(String ticketStatus) {
		this.ticketStatus = ticketStatus;
	}

	public String getRequesterLocation() {
		return requesterLocation;
	}

	public void setRequesterLocation(String requesterLocation) {
		this.requesterLocation = requesterLocation;
	}

	public String getRequesterMobile() {
		return requesterMobile;
	}

	public void setRequesterMobile(String requesterMobile) {
		this.requesterMobile = requesterMobile;
	}

	public LocalDateTime getAccessRequiredTill() {
		return accessRequiredTill;
	}

	public void setAccessRequiredTill(LocalDateTime accessRequiredTill) {
		this.accessRequiredTill = accessRequiredTill;
	}

	public Long getRequestedByUserId() {
		return requestedByUserId;
	}

	public void setRequestedByUserId(Long requestedByUserId) {
		this.requestedByUserId = requestedByUserId;
	}

	public String getRequestedByUserName() {
		return requestedByUserName;
	}

	public void setRequestedByUserName(String requestedByUserName) {
		this.requestedByUserName = requestedByUserName;
	}

	public Long getAssignedBySpId() {
		return assignedBySpId;
	}

	public void setAssignedBySpId(Long assignedBySpId) {
		this.assignedBySpId = assignedBySpId;
	}

	public String getAssignedBySpName() {
		return assignedBySpName;
	}

	public void setAssignedBySpName(String assignedBySpName) {
		this.assignedBySpName = assignedBySpName;
	}

	public Long getApprovedByManagerId() {
		return approvedByManagerId;
	}

	public void setApprovedByManagerId(Long approvedByManagerId) {
		this.approvedByManagerId = approvedByManagerId;
	}

	public String getApprovedByManagerName() {
		return approvedByManagerName;
	}

	public void setApprovedByManagerName(String approvedByManagerName) {
		this.approvedByManagerName = approvedByManagerName;
	}

	public MappingStatus getStatus() {
		return status;
	}

	public void setStatus(MappingStatus status) {
		this.status = status;
	}

	public String getSpRemarks() {
		return spRemarks;
	}

	public void setSpRemarks(String spRemarks) {
		this.spRemarks = spRemarks;
	}

	public String getManagerRemarks() {
		return managerRemarks;
	}

	public void setManagerRemarks(String managerRemarks) {
		this.managerRemarks = managerRemarks;
	}

	public String getAdditionalDetailsRequest() {
		return additionalDetailsRequest;
	}

	public void setAdditionalDetailsRequest(String additionalDetailsRequest) {
		this.additionalDetailsRequest = additionalDetailsRequest;
	}

	public String getAdditionalDetailsResponse() {
		return additionalDetailsResponse;
	}

	public void setAdditionalDetailsResponse(String additionalDetailsResponse) {
		this.additionalDetailsResponse = additionalDetailsResponse;
	}

	public LocalDateTime getSpApprovedAt() {
		return spApprovedAt;
	}

	public void setSpApprovedAt(LocalDateTime spApprovedAt) {
		this.spApprovedAt = spApprovedAt;
	}

	public LocalDateTime getManagerApprovedAt() {
		return managerApprovedAt;
	}

	public void setManagerApprovedAt(LocalDateTime managerApprovedAt) {
		this.managerApprovedAt = managerApprovedAt;
	}

	public LocalDateTime getAssignedFrom() {
		return assignedFrom;
	}

	public void setAssignedFrom(LocalDateTime assignedFrom) {
		this.assignedFrom = assignedFrom;
	}

	public LocalDateTime getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(LocalDateTime assignedTo) {
		this.assignedTo = assignedTo;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
