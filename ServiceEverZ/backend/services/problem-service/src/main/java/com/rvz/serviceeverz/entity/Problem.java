package com.rvz.serviceeverz.entity;



import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.ProblemImpact;
import com.rvz.serviceeverz.enums.ProblemPriority;
import com.rvz.serviceeverz.enums.ProblemStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "problems")
public class Problem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(unique = true, nullable = false)
	private String problemNumber;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ProblemStatus status = ProblemStatus.LOGGED;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ProblemPriority priority;

	@Enumerated(EnumType.STRING)
	private ProblemImpact impact;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "category_id", nullable = false)
	private ProblemCategory category;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "sub_category_id")
	private ProblemSubCategory subCategory;

	private String ciName;
	private Long createdBySpId;
	private Long managerId;

	@Column(columnDefinition = "TEXT")
	private String rootCause;

	@Column(columnDefinition = "TEXT")
	private String workaround;

	private LocalDateTime workaroundProvidedAt;

	@Column(columnDefinition = "TEXT")
	private String permanentFix;

	private LocalDateTime permanentFixAppliedAt;

	@Column(nullable = false)
	private Boolean hasKnownErrorRecord = false;

	private LocalDateTime closedAt;

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

	public String getProblemNumber() {
		return problemNumber;
	}

	public void setProblemNumber(String problemNumber) {
		this.problemNumber = problemNumber;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public ProblemStatus getStatus() {
		return status;
	}

	public void setStatus(ProblemStatus status) {
		this.status = status;
	}

	public ProblemPriority getPriority() {
		return priority;
	}

	public void setPriority(ProblemPriority priority) {
		this.priority = priority;
	}

	public ProblemImpact getImpact() {
		return impact;
	}

	public void setImpact(ProblemImpact impact) {
		this.impact = impact;
	}

	public ProblemCategory getCategory() {
		return category;
	}

	public void setCategory(ProblemCategory category) {
		this.category = category;
	}

	public ProblemSubCategory getSubCategory() {
		return subCategory;
	}

	public void setSubCategory(ProblemSubCategory subCategory) {
		this.subCategory = subCategory;
	}

	public String getCiName() {
		return ciName;
	}

	public void setCiName(String ciName) {
		this.ciName = ciName;
	}

	public Long getCreatedBySpId() {
		return createdBySpId;
	}

	public void setCreatedBySpId(Long createdBySpId) {
		this.createdBySpId = createdBySpId;
	}

	public Long getManagerId() {
		return managerId;
	}

	public void setManagerId(Long managerId) {
		this.managerId = managerId;
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

	public LocalDateTime getWorkaroundProvidedAt() {
		return workaroundProvidedAt;
	}

	public void setWorkaroundProvidedAt(LocalDateTime w) {
		this.workaroundProvidedAt = w;
	}

	public String getPermanentFix() {
		return permanentFix;
	}

	public void setPermanentFix(String permanentFix) {
		this.permanentFix = permanentFix;
	}

	public LocalDateTime getPermanentFixAppliedAt() {
		return permanentFixAppliedAt;
	}

	public void setPermanentFixAppliedAt(LocalDateTime p) {
		this.permanentFixAppliedAt = p;
	}

	public Boolean getHasKnownErrorRecord() {
		return hasKnownErrorRecord;
	}

	public void setHasKnownErrorRecord(Boolean h) {
		this.hasKnownErrorRecord = h;
	}

	public LocalDateTime getClosedAt() {
		return closedAt;
	}

	public void setClosedAt(LocalDateTime closedAt) {
		this.closedAt = closedAt;
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