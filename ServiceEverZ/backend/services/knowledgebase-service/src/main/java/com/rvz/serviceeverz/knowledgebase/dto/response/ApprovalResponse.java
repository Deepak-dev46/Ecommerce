package com.rvz.serviceeverz.knowledgebase.dto.response;

import com.rvz.serviceeverz.knowledgebase.enums.ApprovalStatus;

public class ApprovalResponse {
	private Long id;
	private Long versionId;
	private Long approverId;
	private ApprovalStatus status;
	private String comments;
	private String decidedAt;
	private String createdAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getVersionId() {
		return versionId;
	}

	public void setVersionId(Long v) {
		this.versionId = v;
	}

	public Long getApproverId() {
		return approverId;
	}

	public void setApproverId(Long a) {
		this.approverId = a;
	}

	public ApprovalStatus getStatus() {
		return status;
	}

	public void setStatus(ApprovalStatus s) {
		this.status = s;
	}

	public String getComments() {
		return comments;
	}

	public void setComments(String c) {
		this.comments = c;
	}

	public String getDecidedAt() {
		return decidedAt;
	}

	public void setDecidedAt(String t) {
		this.decidedAt = t;
	}

	public String getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(String t) {
		this.createdAt = t;
	}
}
