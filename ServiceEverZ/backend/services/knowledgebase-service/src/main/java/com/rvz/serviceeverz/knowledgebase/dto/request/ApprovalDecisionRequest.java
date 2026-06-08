package com.rvz.serviceeverz.knowledgebase.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rvz.serviceeverz.knowledgebase.enums.ApprovalStatus;
import jakarta.validation.constraints.NotNull;

public class ApprovalDecisionRequest {

	@NotNull(message = "approverId is required and must be a valid user ID")
	@JsonProperty("approverId")
	private Long approverId;

	@NotNull(message = "status is required (APPROVED, REJECTED, or SENT_BACK)")
	@JsonProperty("status")
	private ApprovalStatus status;

	@JsonProperty("comments")
	private String comments;

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
}
