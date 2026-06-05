package com.rvz.serviceeverz.dto.response;


import java.time.LocalDateTime;

public class KnownErrorRecordResponse {

	private Long id;
	private String kerNumber;
	private Long problemId;
	private String problemNumber;
	private String title;
	private String symptoms;
	private String rootCause;
	private String workaround;
	private String permanentFix;
	private String affectedCi;
	private Long createdBySpId;
	private String createdBySpName;
	private Boolean isActive;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getKerNumber() {
		return kerNumber;
	}

	public void setKerNumber(String kerNumber) {
		this.kerNumber = kerNumber;
	}

	public Long getProblemId() {
		return problemId;
	}

	public void setProblemId(Long problemId) {
		this.problemId = problemId;
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

	public String getSymptoms() {
		return symptoms;
	}

	public void setSymptoms(String symptoms) {
		this.symptoms = symptoms;
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

	public String getPermanentFix() {
		return permanentFix;
	}

	public void setPermanentFix(String permanentFix) {
		this.permanentFix = permanentFix;
	}

	public String getAffectedCi() {
		return affectedCi;
	}

	public void setAffectedCi(String affectedCi) {
		this.affectedCi = affectedCi;
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

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
