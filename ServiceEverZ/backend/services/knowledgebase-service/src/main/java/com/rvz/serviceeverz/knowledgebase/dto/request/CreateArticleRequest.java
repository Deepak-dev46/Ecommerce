package com.rvz.serviceeverz.knowledgebase.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateArticleRequest {
	@NotBlank(message = "Title is required")
	private String title;
	private String summary;
	private String changeSummary;
	private Long categoryId;
	private Long authorId;

	public String getTitle() { return title; }
	public void setTitle(String t) { this.title = t; }

	public String getSummary() { return summary; }
	public void setSummary(String s) { this.summary = s; }

	public String getChangeSummary() { return changeSummary; }
	public void setChangeSummary(String s) { this.changeSummary = s; }

	public Long getCategoryId() { return categoryId; }
	public void setCategoryId(Long c) { this.categoryId = c; }

	public Long getAuthorId() { return authorId; }
	public void setAuthorId(Long a) { this.authorId = a; }
}
