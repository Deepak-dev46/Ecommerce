package com.rvz.serviceeverz.dto.response;


import java.time.LocalDateTime;
import java.util.List;

import com.rvz.serviceeverz.enums.ProblemImpact;
import com.rvz.serviceeverz.enums.ProblemPriority;
import com.rvz.serviceeverz.enums.ProblemStatus;

public class ProblemResponse {

	private Long id;
	private String problemNumber;
	private String title;
	private String description;
	private ProblemStatus status;
	private ProblemPriority priority;
	private ProblemImpact impact;
	private Long categoryId;
	private String categoryName;
	private Long subCategoryId;
	private String subCategoryName;
	private String ciName;
	private Long createdBySpId;
	private String createdBySpName;
	private Long managerId;
	private String managerName;
	private String rootCause;
	private String workaround;
	private LocalDateTime workaroundProvidedAt;
	private String permanentFix;
	private LocalDateTime permanentFixAppliedAt;
	private Boolean hasKnownErrorRecord;
	private LocalDateTime closedAt;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private List<LinkedIncidentDto> linkedIncidents;

	/** All file attachments grouped across all sections (SOLUTION, ROOT_CAUSE, WORKAROUND, PERMANENT_FIX) */
	private List<ProblemAttachmentResponse> attachments;

	public static class LinkedIncidentDto {
		private Long linkId;
		private Long incidentId;
		private String incidentTitle;
		private String notes;
		private LocalDateTime linkedAt;

		public Long getLinkId() {
			return linkId;
		}

		public void setLinkId(Long linkId) {
			this.linkId = linkId;
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

	public Long getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public Long getSubCategoryId() {
		return subCategoryId;
	}

	public void setSubCategoryId(Long subCategoryId) {
		this.subCategoryId = subCategoryId;
	}

	public String getSubCategoryName() {
		return subCategoryName;
	}

	public void setSubCategoryName(String subCategoryName) {
		this.subCategoryName = subCategoryName;
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

	public String getCreatedBySpName() {
		return createdBySpName;
	}

	public void setCreatedBySpName(String createdBySpName) {
		this.createdBySpName = createdBySpName;
	}

	public Long getManagerId() {
		return managerId;
	}

	public void setManagerId(Long managerId) {
		this.managerId = managerId;
	}

	public String getManagerName() {
		return managerName;
	}

	public void setManagerName(String managerName) {
		this.managerName = managerName;
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

	public List<LinkedIncidentDto> getLinkedIncidents() {
		return linkedIncidents;
	}

	public void setLinkedIncidents(List<LinkedIncidentDto> linkedIncidents) {
		this.linkedIncidents = linkedIncidents;
	}

	public List<ProblemAttachmentResponse> getAttachments() {
		return attachments;
	}

	public void setAttachments(List<ProblemAttachmentResponse> attachments) {
		this.attachments = attachments;
	}
}
