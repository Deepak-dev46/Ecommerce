package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
 
public class ManagerDecisionRequest {
    @NotNull private Long managerId;
    @NotBlank(message = "Decision required: APPROVE | REJECT | REQUEST_ADDITIONAL_DETAILS") private String decision;
    private String remarks;
    private String additionalDetailsRequest;
 
    public Long getManagerId() { return managerId; } public void setManagerId(Long v) { managerId = v; }
    public String getDecision() { return decision; } public void setDecision(String v) { decision = v; }
    public String getRemarks() { return remarks; } public void setRemarks(String v) { remarks = v; }
    public String getAdditionalDetailsRequest() { return additionalDetailsRequest; } public void setAdditionalDetailsRequest(String v) { additionalDetailsRequest = v; }
}
 