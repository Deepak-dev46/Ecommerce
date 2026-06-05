package com.rvz.serviceeverz.knowledgebase.dto.response;

import com.rvz.serviceeverz.knowledgebase.enums.VersionStatus;

public class VersionHistoryResponse {
	private Long versionId;
	private Integer versionNumber;
	private String title;
	private VersionStatus state;
	private Long authorId;
	private String changeSummary;
	private Boolean isActiveVersion;

	// ── Content fields ────────────────────────────────────────────────────────
	private String summary;

	// ── Attachment fields ─────────────────────────────────────────────────────
	private String attachmentOriginalName;
	private String attachmentMimeType;
	private Long attachmentSizeBytes;
	private String attachmentPath;

	// ── Workflow timestamps ───────────────────────────────────────────────────
	private String submittedForApprovalAt;
	private String approvedAt;
	private Long approvedBy;
	private String rejectedAt;
	private Long rejectedBy;
	private String rejectionReason;
	private String sentBackAt;
	private Long sentBackBy;
	private String sentBackReason;
	private String publishedAt;
	private String createdAt;
	private String updatedAt;

	// ── Getters / Setters ─────────────────────────────────────────────────────
	public Long getVersionId() { return versionId; }
	public void setVersionId(Long versionId) { this.versionId = versionId; }

	public Integer getVersionNumber() { return versionNumber; }
	public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public VersionStatus getState() { return state; }
	public void setState(VersionStatus state) { this.state = state; }

	public Long getAuthorId() { return authorId; }
	public void setAuthorId(Long authorId) { this.authorId = authorId; }

	public String getChangeSummary() { return changeSummary; }
	public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }

	public Boolean getIsActiveVersion() { return isActiveVersion; }
	public void setIsActiveVersion(Boolean isActiveVersion) { this.isActiveVersion = isActiveVersion; }

	public String getSummary() { return summary; }
	public void setSummary(String summary) { this.summary = summary; }

	public String getAttachmentOriginalName() { return attachmentOriginalName; }
	public void setAttachmentOriginalName(String s) { this.attachmentOriginalName = s; }

	public String getAttachmentMimeType() { return attachmentMimeType; }
	public void setAttachmentMimeType(String s) { this.attachmentMimeType = s; }

	public Long getAttachmentSizeBytes() { return attachmentSizeBytes; }
	public void setAttachmentSizeBytes(Long s) { this.attachmentSizeBytes = s; }

	public String getAttachmentPath() { return attachmentPath; }
	public void setAttachmentPath(String s) { this.attachmentPath = s; }

	public String getSubmittedForApprovalAt() { return submittedForApprovalAt; }
	public void setSubmittedForApprovalAt(String submittedForApprovalAt) { this.submittedForApprovalAt = submittedForApprovalAt; }

	public String getApprovedAt() { return approvedAt; }
	public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }

	public Long getApprovedBy() { return approvedBy; }
	public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }

	public String getRejectedAt() { return rejectedAt; }
	public void setRejectedAt(String rejectedAt) { this.rejectedAt = rejectedAt; }

	public Long getRejectedBy() { return rejectedBy; }
	public void setRejectedBy(Long rejectedBy) { this.rejectedBy = rejectedBy; }

	public String getRejectionReason() { return rejectionReason; }
	public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

	public String getSentBackAt() { return sentBackAt; }
	public void setSentBackAt(String sentBackAt) { this.sentBackAt = sentBackAt; }

	public Long getSentBackBy() { return sentBackBy; }
	public void setSentBackBy(Long sentBackBy) { this.sentBackBy = sentBackBy; }

	public String getSentBackReason() { return sentBackReason; }
	public void setSentBackReason(String sentBackReason) { this.sentBackReason = sentBackReason; }

	public String getPublishedAt() { return publishedAt; }
	public void setPublishedAt(String publishedAt) { this.publishedAt = publishedAt; }

	public String getCreatedAt() { return createdAt; }
	public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

	public String getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
