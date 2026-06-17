package com.rvz.serviceeverz.dto.request;
import com.rvz.serviceeverz.enums.ChangeStatus;

import jakarta.validation.constraints.NotNull;

public class ManagerDecisionRequest {
    @NotNull(message = "Manager ID is required") private Long managerId;
    @NotNull(message = "Decision is required") private ChangeStatus decision;
    private String comment;

    public ManagerDecisionRequest() {}
    public Long getManagerId() { return managerId; } public void setManagerId(Long v) { managerId = v; }
    public ChangeStatus getDecision() { return decision; } public void setDecision(ChangeStatus v) { decision = v; }
    public String getComment() { return comment; } public void setComment(String v) { comment = v; }
}
