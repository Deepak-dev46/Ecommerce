package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.NotNull;

public class AssetMappingRequest {
	@NotNull(message = "Asset ID is required")
	private Long assetId;
	private Long ticketId;
	private Long requestedByUserId;
	@NotNull(message = "Assigned SP ID is required")
	private Long assignedBySpId;
	private String spRemarks;

	public Long getAssetId() {
		return assetId;
	}

	public void setAssetId(Long v) {
		assetId = v;
	}

	public Long getTicketId() {
		return ticketId;
	}

	public void setTicketId(Long v) {
		ticketId = v;
	}

	public Long getRequestedByUserId() {
		return requestedByUserId;
	}

	public void setRequestedByUserId(Long v) {
		requestedByUserId = v;
	}

	public Long getAssignedBySpId() {
		return assignedBySpId;
	}

	public void setAssignedBySpId(Long v) {
		assignedBySpId = v;
	}

	public String getSpRemarks() {
		return spRemarks;
	}

	public void setSpRemarks(String v) {
		spRemarks = v;
	}
}
