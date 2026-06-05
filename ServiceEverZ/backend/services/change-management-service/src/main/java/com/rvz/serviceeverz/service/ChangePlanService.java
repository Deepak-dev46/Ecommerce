package com.rvz.serviceeverz.service;
import java.util.List;

import com.rvz.serviceeverz.dto.request.CreateChangePlanRequest;
import com.rvz.serviceeverz.dto.request.ManagerDecisionRequest;
import com.rvz.serviceeverz.dto.request.UpdateChangePlanRequest;
import com.rvz.serviceeverz.dto.response.ChangeAuditLogResponse;
import com.rvz.serviceeverz.dto.response.ChangePlanResponse;
import com.rvz.serviceeverz.enums.ChangeStatus;

public interface ChangePlanService {
    ChangePlanResponse createChangePlan(CreateChangePlanRequest request);
    ChangePlanResponse updateChangePlan(Long id, UpdateChangePlanRequest request);
    void deleteChangePlan(Long id);
    ChangePlanResponse submitForApproval(Long id, Long spId);
    ChangePlanResponse makeDecision(Long id, ManagerDecisionRequest request);
    ChangePlanResponse getChangePlanById(Long id);
    List<ChangePlanResponse> getAllChangePlans();
    List<ChangePlanResponse> getChangePlansBySpId(Long spId);
    List<ChangePlanResponse> getChangePlansByStatus(ChangeStatus status);
    List<ChangeAuditLogResponse> getAuditLogs(Long changePlanId);
}
