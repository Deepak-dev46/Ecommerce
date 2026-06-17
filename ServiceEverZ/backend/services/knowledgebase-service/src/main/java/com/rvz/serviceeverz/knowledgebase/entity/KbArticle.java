package com.rvz.serviceeverz.knowledgebase.entity;

import com.rvz.serviceeverz.knowledgebase.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "kb_article")
public class KbArticle {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(unique = true, nullable = false)
	private String kbNumber;
	@Column(nullable = false)
	private String title;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ArticleStatus status;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ArticleVisibility visibility;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ArticleCreationType creationType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id")
	private KbCategory category;

	@ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
	@JoinTable(name = "kb_article_tag", joinColumns = @JoinColumn(name = "article_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
	private Set<KbTag> tags = new HashSet<>();

	private Long currentVersionId;
	@Column(nullable = false)
	private Long createdBy;
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
	@Column(nullable = false)
	private LocalDateTime updatedAt;
	@Column(nullable = false)
	private Boolean isDeleted;

	@PrePersist
	public void prePersist() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		if (isDeleted == null)
			isDeleted = false;
		if (visibility == null)
			visibility = ArticleVisibility.EXTERNAL;
		if (creationType == null)
			creationType = ArticleCreationType.FORM;
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

	public String getKbNumber() {
		return kbNumber;
	}

	public void setKbNumber(String kbNumber) {
		this.kbNumber = kbNumber;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public ArticleStatus getStatus() {
		return status;
	}

	public void setStatus(ArticleStatus status) {
		this.status = status;
	}

	public ArticleVisibility getVisibility() {
		return visibility;
	}

	public void setVisibility(ArticleVisibility visibility) {
		this.visibility = visibility;
	}

	public ArticleCreationType getCreationType() {
		return creationType;
	}

	public void setCreationType(ArticleCreationType creationType) {
		this.creationType = creationType;
	}

	public KbCategory getCategory() {
		return category;
	}

	public void setCategory(KbCategory category) {
		this.category = category;
	}

	public Set<KbTag> getTags() {
		return tags;
	}

	public void setTags(Set<KbTag> tags) {
		this.tags = tags;
	}

	public Long getCurrentVersionId() {
		return currentVersionId;
	}

	public void setCurrentVersionId(Long currentVersionId) {
		this.currentVersionId = currentVersionId;
	}

	public Long getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Long createdBy) {
		this.createdBy = createdBy;
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

	public Boolean getIsDeleted() {
		return isDeleted;
	}

	public void setIsDeleted(Boolean isDeleted) {
		this.isDeleted = isDeleted;
	}
}
