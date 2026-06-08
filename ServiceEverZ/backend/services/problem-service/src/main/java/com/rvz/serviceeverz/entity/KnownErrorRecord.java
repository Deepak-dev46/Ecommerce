package com.rvz.serviceeverz.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "known_error_records")
public class KnownErrorRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(unique = true)
	private String kerNumber;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "problem_id", nullable = false, unique = true)
	private Problem problem;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String symptoms;

	@Column(columnDefinition = "TEXT")
	private String rootCause;

	@Column(columnDefinition = "TEXT")
	private String workaround;

	@Column(columnDefinition = "TEXT")
	private String permanentFix;

	private String affectedCi;
	private Long createdBySpId;

	@Column(nullable = false)
	private Boolean isActive = true;

	@Column(updatable = false)
	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@PrePersist
	public void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getKerNumber() {
		return kerNumber;
	}

	public void setKerNumber(String kerNumber) {
		this.kerNumber = kerNumber;
	}

	public Problem getProblem() {
		return problem;
	}

	public void setProblem(Problem problem) {
		this.problem = problem;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getSymptoms() {
		return symptoms;
	}

	public void setSymptoms(String symptoms) {
		this.symptoms = symptoms;
	}

	public String getRootCause() {
		return rootCause;
	}

	public void setRootCause(String rootCause) {
		this.rootCause = rootCause;
	}

	public String getWorkaround() {
		return workaround;
	}

	public void setWorkaround(String workaround) {
		this.workaround = workaround;
	}

	public String getPermanentFix() {
		return permanentFix;
	}

	public void setPermanentFix(String permanentFix) {
		this.permanentFix = permanentFix;
	}

	public String getAffectedCi() {
		return affectedCi;
	}

	public void setAffectedCi(String affectedCi) {
		this.affectedCi = affectedCi;
	}

	public Long getCreatedBySpId() {
		return createdBySpId;
	}

	public void setCreatedBySpId(Long createdBySpId) {
		this.createdBySpId = createdBySpId;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
