package com.rvz.serviceeverz.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "problem_incident_links")
public class ProblemIncidentLink {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "problem_id", nullable = false)
	private Problem problem;

	@Column(nullable = false)
	private Long incidentId;

	private String incidentTitle;
	private Long linkedBySpId;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@Column(updatable = false)
	private LocalDateTime linkedAt;

	@PrePersist
	public void onCreate() {
		this.linkedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Problem getProblem() {
		return problem;
	}

	public void setProblem(Problem problem) {
		this.problem = problem;
	}

	public Long getIncidentId() {
		return incidentId;
	}

	public void setIncidentId(Long incidentId) {
		this.incidentId = incidentId;
	}

	public String getIncidentTitle() {
		return incidentTitle;
	}

	public void setIncidentTitle(String incidentTitle) {
		this.incidentTitle = incidentTitle;
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

	public LocalDateTime getLinkedAt() {
		return linkedAt;
	}

	public void setLinkedAt(LocalDateTime linkedAt) {
		this.linkedAt = linkedAt;
	}
}