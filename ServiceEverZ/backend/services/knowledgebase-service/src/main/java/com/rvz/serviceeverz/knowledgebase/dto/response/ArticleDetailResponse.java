package com.rvz.serviceeverz.knowledgebase.dto.response;

import com.rvz.serviceeverz.knowledgebase.enums.*;
import java.util.List;

public class ArticleDetailResponse {
	private Long id;
	private String kbNumber;
	private String title;
	private ArticleStatus status;
	private ArticleVisibility visibility;
	private ArticleCreationType creationType;
	private Long currentVersionId;
	private Integer currentVersionNumber;
	private String summary;
	private String changeSummary;
	private String attachmentOriginalName;
	private String attachmentMimeType;
	private Long attachmentSizeBytes;
	private String attachmentPath;
	private Long authorId;
	private String categoryName;
	private Long categoryId;
	private List<String> tags;
	private Double averageRating;
	private Long ratingCount;
	private String publishedAt;
	private String createdAt;
	private String updatedAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getKbNumber() { return kbNumber; }
	public void setKbNumber(String k) { this.kbNumber = k; }

	public String getTitle() { return title; }
	public void setTitle(String t) { this.title = t; }

	public ArticleStatus getStatus() { return status; }
	public void setStatus(ArticleStatus s) { this.status = s; }

	public ArticleVisibility getVisibility() { return visibility; }
	public void setVisibility(ArticleVisibility v) { this.visibility = v; }

	public ArticleCreationType getCreationType() { return creationType; }
	public void setCreationType(ArticleCreationType c) { this.creationType = c; }

	public Long getCurrentVersionId() { return currentVersionId; }
	public void setCurrentVersionId(Long v) { this.currentVersionId = v; }

	public Integer getCurrentVersionNumber() { return currentVersionNumber; }
	public void setCurrentVersionNumber(Integer v) { this.currentVersionNumber = v; }

	public String getSummary() { return summary; }
	public void setSummary(String s) { this.summary = s; }

	public String getChangeSummary() { return changeSummary; }
	public void setChangeSummary(String s) { this.changeSummary = s; }

	public String getAttachmentOriginalName() { return attachmentOriginalName; }
	public void setAttachmentOriginalName(String s) { this.attachmentOriginalName = s; }

	public String getAttachmentMimeType() { return attachmentMimeType; }
	public void setAttachmentMimeType(String s) { this.attachmentMimeType = s; }

	public Long getAttachmentSizeBytes() { return attachmentSizeBytes; }
	public void setAttachmentSizeBytes(Long s) { this.attachmentSizeBytes = s; }

	public String getAttachmentPath() { return attachmentPath; }
	public void setAttachmentPath(String s) { this.attachmentPath = s; }

	public Long getAuthorId() { return authorId; }
	public void setAuthorId(Long a) { this.authorId = a; }

	public String getCategoryName() { return categoryName; }
	public void setCategoryName(String c) { this.categoryName = c; }

	public Long getCategoryId() { return categoryId; }
	public void setCategoryId(Long c) { this.categoryId = c; }

	public List<String> getTags() { return tags; }
	public void setTags(List<String> t) { this.tags = t; }

	public Double getAverageRating() { return averageRating; }
	public void setAverageRating(Double r) { this.averageRating = r; }

	public Long getRatingCount() { return ratingCount; }
	public void setRatingCount(Long r) { this.ratingCount = r; }

	public String getPublishedAt() { return publishedAt; }
	public void setPublishedAt(String t) { this.publishedAt = t; }

	public String getCreatedAt() { return createdAt; }
	public void setCreatedAt(String t) { this.createdAt = t; }

	public String getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(String t) { this.updatedAt = t; }
}
