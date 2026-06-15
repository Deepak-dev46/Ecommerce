package com.rvz.serviceeverz.dto.request;

import com.rvz.serviceeverz.enums.ProblemImpact;
import com.rvz.serviceeverz.enums.ProblemPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateProblemRequest {

	@NotBlank(message = "Title is required")
	private String title;

	@NotBlank(message = "Description is required")
	private String description;

	@NotNull(message = "Priority is required")
	private ProblemPriority priority;

	@NotNull(message = "Impact is required")
	private ProblemImpact impact;

	@NotNull(message = "Category ID is required")
	private Long categoryId;

	private Long subCategoryId;
	private String ciName;

	@NotNull(message = "Support Personnel ID is required")
	private Long createdBySpId;

	private Long triggeringIncidentId;

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

	public Long getSubCategoryId() {
		return subCategoryId;
	}

	public void setSubCategoryId(Long subCategoryId) {
		this.subCategoryId = subCategoryId;
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

	public Long getTriggeringIncidentId() {
		return triggeringIncidentId;
	}

	public void setTriggeringIncidentId(Long triggeringIncidentId) {
		this.triggeringIncidentId = triggeringIncidentId;
	}
}
