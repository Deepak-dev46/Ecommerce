package com.rvz.serviceeverz.knowledgebase.dto.response;

public class CategoryResponse {
	private Long id;
	private String name;
	private String description;
	private Long parentId;
	private Boolean isActive;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String n) {
		this.name = n;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String d) {
		this.description = d;
	}

	public Long getParentId() {
		return parentId;
	}

	public void setParentId(Long p) {
		this.parentId = p;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean b) {
		this.isActive = b;
	}
}
