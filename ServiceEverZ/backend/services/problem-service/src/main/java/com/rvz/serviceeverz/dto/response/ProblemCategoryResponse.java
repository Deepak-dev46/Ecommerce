package com.rvz.serviceeverz.dto.response;


import java.time.LocalDateTime;
import java.util.List;

public class ProblemCategoryResponse {

	private Long id;
	private String name;
	private String description;
	private Boolean isActive;
	private LocalDateTime createdAt;
	private List<SubCategoryDto> subCategories;

	public static class SubCategoryDto {
		private Long id;
		private String name;
		private String description;
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

		public void setName(String name) {
			this.name = name;
		}

		public String getDescription() {
			return description;
		}

		public void setDescription(String description) {
			this.description = description;
		}

		public Boolean getIsActive() {
			return isActive;
		}

		public void setIsActive(Boolean isActive) {
			this.isActive = isActive;
		}
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public List<SubCategoryDto> getSubCategories() {
		return subCategories;
	}

	public void setSubCategories(List<SubCategoryDto> subCategories) {
		this.subCategories = subCategories;
	}
}
