package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.NotNull;

public class LinkIncidentRequest {

	@NotNull(message = "Incident ID is required")
	private Long incidentId;

	@NotNull(message = "Support Personnel ID is required")
	private Long linkedBySpId;

	private String notes;

	public Long getIncidentId() {
		return incidentId;
	}

	public void setIncidentId(Long incidentId) {
		this.incidentId = incidentId;
	}

	public Long getLinkedBySpId() {
		return linkedBySpId;
	}

	public void setLinkedBySpId(Long linkedBySpId) {
		this.linkedBySpId = linkedBySpId;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}
}
