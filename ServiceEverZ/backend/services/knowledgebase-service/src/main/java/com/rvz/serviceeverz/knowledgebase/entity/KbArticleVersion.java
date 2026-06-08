package com.rvz.serviceeverz.knowledgebase.entity;

import com.rvz.serviceeverz.knowledgebase.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kb_article_version", uniqueConstraints = @UniqueConstraint(columnNames = { "article_id",
		"version_number" }))
public class KbArticleVersion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "article_id", nullable = false)
	private KbArticle article;
	@Column(nullable = false)
	private Integer versionNumber;
	@Column(nullable = false)
	private String title;
	// FIX (Bug 4): Changed from @Column(length=500) / VARCHAR(500) to TEXT.
	// ReactQuill HTML content routinely exceeds 500 bytes; truncation caused silent
	// data loss where the saved summary would be cut mid-tag, breaking rendering.
	@Column(columnDefinition = "TEXT")
	private String summary;
	/** What changed vs previous version — shown in version history for all roles */
	@Column(columnDefinition = "TEXT")
	private String changeSummary;
	private String attachmentPath;
	private String attachmentOriginalName;
	private String attachmentMimeType;
	private Long attachmentSizeBytes;
	@Enumerated(EnumType.STRING)
	private ArticleCreationType creationType;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private VersionStatus state;
	@Column(nullable = false)
	private Long authorId;
	private LocalDateTime submittedForApprovalAt;
	private LocalDateTime approvedAt;
	private Long approvedBy;
	private LocalDateTime rejectedAt;
	private Long rejectedBy;
	private String rejectionReason;
	private LocalDateTime sentBackAt;
	private Long sentBackBy;
	private String sentBackReason;
	private LocalDateTime publishedAt;
	private LocalDateTime expiresAt;
	@Column(nullable = false)
	private Boolean isActiveVersion;
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	public void prePersist() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		if (isActiveVersion == null)
			isActiveVersion = false;
		if (state == null)
			state = VersionStatus.DRAFT;
	}

	@PreUpdate
	public void preUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public KbArticle getArticle() {
		return article;
	}

	public void setArticle(KbArticle a) {
		this.article = a;
	}

	public Integer getVersionNumber() {
		return versionNumber;
	}

	public void setVersionNumber(Integer v) {
		this.versionNumber = v;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getSummary() {
		return summary;
	}

	public void setSummary(String s) {
		this.summary = s;
	}

	public String getChangeSummary() {
		return changeSummary;
	}

	public void setChangeSummary(String s) {
		this.changeSummary = s;
	}

	public String getAttachmentPath() {
		return attachmentPath;
	}

	public void setAttachmentPath(String s) {
		this.attachmentPath = s;
	}

	public String getAttachmentOriginalName() {
		return attachmentOriginalName;
	}

	public void setAttachmentOriginalName(String s) {
		this.attachmentOriginalName = s;
	}

	public String getAttachmentMimeType() {
		return attachmentMimeType;
	}

	public void setAttachmentMimeType(String s) {
		this.attachmentMimeType = s;
	}

	public Long getAttachmentSizeBytes() {
		return attachmentSizeBytes;
	}

	public void setAttachmentSizeBytes(Long s) {
		this.attachmentSizeBytes = s;
	}

	public ArticleCreationType getCreationType() {
		return creationType;
	}

	public void setCreationType(ArticleCreationType t) {
		this.creationType = t;
	}

	public VersionStatus getState() {
		return state;
	}

	public void setState(VersionStatus s) {
		this.state = s;
	}

	public Long getAuthorId() {
		return authorId;
	}

	public void setAuthorId(Long a) {
		this.authorId = a;
	}

	public LocalDateTime getSubmittedForApprovalAt() {
		return submittedForApprovalAt;
	}

	public void setSubmittedForApprovalAt(LocalDateTime t) {
		this.submittedForApprovalAt = t;
	}

	public LocalDateTime getApprovedAt() {
		return approvedAt;
	}

	public void setApprovedAt(LocalDateTime t) {
		this.approvedAt = t;
	}

	public Long getApprovedBy() {
		return approvedBy;
	}

	public void setApprovedBy(Long v) {
		this.approvedBy = v;
	}

	public LocalDateTime getRejectedAt() {
		return rejectedAt;
	}

	public void setRejectedAt(LocalDateTime t) {
		this.rejectedAt = t;
	}

	public Long getRejectedBy() {
		return rejectedBy;
	}

	public void setRejectedBy(Long v) {
		this.rejectedBy = v;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String s) {
		this.rejectionReason = s;
	}

	public LocalDateTime getSentBackAt() {
		return sentBackAt;
	}

	public void setSentBackAt(LocalDateTime t) {
		this.sentBackAt = t;
	}

	public Long getSentBackBy() {
		return sentBackBy;
	}

	public void setSentBackBy(Long v) {
		this.sentBackBy = v;
	}

	public String getSentBackReason() {
		return sentBackReason;
	}

	public void setSentBackReason(String s) {
		this.sentBackReason = s;
	}

	public LocalDateTime getPublishedAt() {
		return publishedAt;
	}

	public void setPublishedAt(LocalDateTime t) {
		this.publishedAt = t;
	}

	public LocalDateTime getExpiresAt() {
		return expiresAt;
	}

	public void setExpiresAt(LocalDateTime t) {
		this.expiresAt = t;
	}

	public Boolean getIsActiveVersion() {
		return isActiveVersion;
	}

	public void setIsActiveVersion(Boolean b) {
		this.isActiveVersion = b;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime t) {
		this.createdAt = t;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime t) {
		this.updatedAt = t;
	}
}
