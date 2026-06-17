package com.rvz.serviceeverz.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.ChangePriority;
import com.rvz.serviceeverz.enums.ChangeStatus;
import com.rvz.serviceeverz.enums.ChangeType;

@Entity
@Table(name = "change_plans")
public class ChangePlan {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "change_number", unique = true, nullable = false)
	private String changeNumber;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "change_type", nullable = false)
	private ChangeType changeType;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ChangePriority priority;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ChangeStatus status;

	@Column(name = "planned_start_time", nullable = false)
	private LocalDateTime plannedStartTime;
	@Column(name = "planned_end_time", nullable = false)
	private LocalDateTime plannedEndTime;
	@Column(name = "created_by_sp_id", nullable = false)
	private Long createdBySpId;
	@Column(name = "submitted_at")
	private LocalDateTime submittedAt;
	@Column(name = "decision_at")
	private LocalDateTime decisionAt;
	@Column(name = "manager_comment", columnDefinition = "TEXT")
	private String managerComment;
	@Column(name = "revision_count")
	private Integer revisionCount;
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public ChangePlan() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getChangeNumber() {
		return changeNumber;
	}

	public void setChangeNumber(String v) {
		this.changeNumber = v;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String v) {
		this.title = v;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String v) {
		this.description = v;
	}

	public ChangeType getChangeType() {
		return changeType;
	}

	public void setChangeType(ChangeType v) {
		this.changeType = v;
	}

	public ChangePriority getPriority() {
		return priority;
	}

	public void setPriority(ChangePriority v) {
		this.priority = v;
	}

	public ChangeStatus getStatus() {
		return status;
	}

	public void setStatus(ChangeStatus v) {
		this.status = v;
	}

	public LocalDateTime getPlannedStartTime() {
		return plannedStartTime;
	}

	public void setPlannedStartTime(LocalDateTime v) {
		this.plannedStartTime = v;
	}

	public LocalDateTime getPlannedEndTime() {
		return plannedEndTime;
	}

	public void setPlannedEndTime(LocalDateTime v) {
		this.plannedEndTime = v;
	}

	public Long getCreatedBySpId() {
		return createdBySpId;
	}

	public void setCreatedBySpId(Long v) {
		this.createdBySpId = v;
	}

	public LocalDateTime getSubmittedAt() {
		return submittedAt;
	}

	public void setSubmittedAt(LocalDateTime v) {
		this.submittedAt = v;
	}

	public LocalDateTime getDecisionAt() {
		return decisionAt;
	}

	public void setDecisionAt(LocalDateTime v) {
		this.decisionAt = v;
	}

	public String getManagerComment() {
		return managerComment;
	}

	public void setManagerComment(String v) {
		this.managerComment = v;
	}

	public Integer getRevisionCount() {
		return revisionCount;
	}

	public void setRevisionCount(Integer v) {
		this.revisionCount = v;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime v) {
		this.createdAt = v;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime v) {
		this.updatedAt = v;
	}
}
