package com.rvz.serviceeverz.service.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rvz.serviceeverz.dto.request.CreateChangePlanRequest;
import com.rvz.serviceeverz.dto.request.ManagerDecisionRequest;
import com.rvz.serviceeverz.dto.request.UpdateChangePlanRequest;
import com.rvz.serviceeverz.dto.response.ChangeAuditLogResponse;
import com.rvz.serviceeverz.dto.response.ChangePlanResponse;
import com.rvz.serviceeverz.dto.response.UserEmailResponse;
import com.rvz.serviceeverz.entity.ChangeAuditLog;
import com.rvz.serviceeverz.entity.ChangePlan;
import com.rvz.serviceeverz.enums.ChangeStatus;
import com.rvz.serviceeverz.exception.ChangeManagementException;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.repository.ChangeAuditLogRepository;
import com.rvz.serviceeverz.repository.ChangePlanRepository;
import com.rvz.serviceeverz.service.ChangePlanService;
import com.rvz.serviceeverz.service.EmailComposerService;

@Service
public class ChangePlanServiceImpl implements ChangePlanService {

    private final ChangePlanRepository changePlanRepository;
    private final ChangeAuditLogRepository auditLogRepository;
    private final EmailComposerService emailComposerService;
    private final UserServiceClient userServiceClient;

    public ChangePlanServiceImpl(ChangePlanRepository changePlanRepository,
                                  ChangeAuditLogRepository auditLogRepository,
                                  EmailComposerService emailComposerService,
                                  UserServiceClient userServiceClient) {
        this.changePlanRepository = changePlanRepository;
        this.auditLogRepository = auditLogRepository;
        this.emailComposerService = emailComposerService;
        this.userServiceClient = userServiceClient;
    }

    @Override
    @Transactional
    public ChangePlanResponse createChangePlan(CreateChangePlanRequest req) {
        ChangePlan plan = new ChangePlan();
        plan.setChangeNumber(generateChangeNumber());
        plan.setTitle(req.getTitle());
        plan.setDescription(req.getDescription());
        plan.setChangeType(req.getChangeType());
        plan.setPriority(req.getPriority());
        plan.setStatus(ChangeStatus.DRAFT);
        plan.setPlannedStartTime(req.getPlannedStartTime());
        plan.setPlannedEndTime(req.getPlannedEndTime());
        plan.setCreatedBySpId(req.getCreatedBySpId());
        plan.setRevisionCount(0);
        ChangePlan saved = changePlanRepository.save(plan);
        addAuditLog(saved, null, ChangeStatus.DRAFT, req.getCreatedBySpId(), "SP", "Change plan created as DRAFT");
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ChangePlanResponse updateChangePlan(Long id, UpdateChangePlanRequest req) {
        ChangePlan plan = findById(id);
        if (plan.getStatus() != ChangeStatus.DRAFT && plan.getStatus() != ChangeStatus.REVISION_REQUESTED) {
            throw new ChangeManagementException("Cannot edit plan in status: " + plan.getStatus() + ". Only DRAFT or REVISION_REQUESTED allowed.");
        }
        if (req.getTitle() != null)            plan.setTitle(req.getTitle());
        if (req.getDescription() != null)      plan.setDescription(req.getDescription());
        if (req.getChangeType() != null)       plan.setChangeType(req.getChangeType());
        if (req.getPriority() != null)         plan.setPriority(req.getPriority());
        if (req.getPlannedStartTime() != null) plan.setPlannedStartTime(req.getPlannedStartTime());
        if (req.getPlannedEndTime() != null)   plan.setPlannedEndTime(req.getPlannedEndTime());
        return toResponse(changePlanRepository.save(plan));
    }

    @Override
    @Transactional
    public void deleteChangePlan(Long id) {
        ChangePlan plan = findById(id);
        if (plan.getStatus() != ChangeStatus.DRAFT) {
            throw new ChangeManagementException("Only DRAFT plans can be deleted. Current: " + plan.getStatus());
        }
        changePlanRepository.delete(plan);
    }

    @Override
    @Transactional
    public ChangePlanResponse submitForApproval(Long id, Long spId) {
        ChangePlan plan = findById(id);
        if (plan.getStatus() != ChangeStatus.DRAFT && plan.getStatus() != ChangeStatus.REVISION_REQUESTED) {
            throw new ChangeManagementException("Cannot submit plan with status: " + plan.getStatus());
        }
        ChangeStatus prev = plan.getStatus();
        if (prev == ChangeStatus.REVISION_REQUESTED) {
            plan.setRevisionCount(plan.getRevisionCount() + 1);
        }
        plan.setStatus(ChangeStatus.PENDING_APPROVAL);
        plan.setSubmittedAt(LocalDateTime.now());
        ChangePlan saved = changePlanRepository.save(plan);
        String note = "Submitted for approval" + (plan.getRevisionCount() > 0 ? " (Revision #" + plan.getRevisionCount() + ")" : "");
        addAuditLog(saved, prev, ChangeStatus.PENDING_APPROVAL, spId, "SP", note);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ChangePlanResponse makeDecision(Long id, ManagerDecisionRequest req) {
        ChangePlan plan = findById(id);
        if (plan.getStatus() != ChangeStatus.PENDING_APPROVAL) {
            throw new ChangeManagementException("Decision only allowed on PENDING_APPROVAL plans. Current: " + plan.getStatus());
        }
        if (req.getDecision() != ChangeStatus.APPROVED
                && req.getDecision() != ChangeStatus.REJECTED
                && req.getDecision() != ChangeStatus.REVISION_REQUESTED) {
            throw new ChangeManagementException("Invalid decision. Allowed: APPROVED, REJECTED, REVISION_REQUESTED");
        }
        if ((req.getDecision() == ChangeStatus.REJECTED || req.getDecision() == ChangeStatus.REVISION_REQUESTED)
                && (req.getComment() == null || req.getComment().isBlank())) {
            throw new ChangeManagementException("A comment/reason is required when rejecting or requesting revision.");
        }

        ChangeStatus prev = plan.getStatus();
        plan.setStatus(req.getDecision());
        plan.setManagerComment(req.getComment());
        plan.setDecisionAt(LocalDateTime.now());
        ChangePlan saved = changePlanRepository.save(plan);
        addAuditLog(saved, prev, req.getDecision(), req.getManagerId(), "ITSM_MANAGER", req.getComment());

        UserEmailResponse spInfo = userServiceClient.getUserById(plan.getCreatedBySpId()).getData();
        String spEmail = spInfo != null ? spInfo.getEmail() : null;
        String spName = spInfo != null ? spInfo.getFullName() : null;

        switch (req.getDecision()) {
            case APPROVED:
                emailComposerService.sendApprovalNotificationToSp(spEmail, spName, saved);
                List<UserEmailResponse> allUsers = userServiceClient.getAllUsers().getData();
                List<String> allEmails = (allUsers != null ? allUsers.stream() : java.util.stream.Stream.<UserEmailResponse>empty())
                    .filter(u -> u.getEmail() != null && !u.getEmail().isBlank())
                    .map(UserEmailResponse::getEmail)
                    .collect(Collectors.toList());
                emailComposerService.sendMaintenanceNotificationToAllUsers(allEmails, saved);
                break;
            case REJECTED:
                emailComposerService.sendRejectionNotificationToSp(spEmail, spName, saved);
                break;
            case REVISION_REQUESTED:
                emailComposerService.sendRevisionRequestedToSp(spEmail, spName, saved);
                break;
            default:
                break;
        }
        return toResponse(saved);
    }

    @Override public ChangePlanResponse getChangePlanById(Long id) { return toResponse(findById(id)); }
    @Override public List<ChangePlanResponse> getAllChangePlans() { return changePlanRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList()); }
    @Override public List<ChangePlanResponse> getChangePlansBySpId(Long spId) { return changePlanRepository.findAllByCreatedBySpId(spId).stream().map(this::toResponse).collect(Collectors.toList()); }
    @Override public List<ChangePlanResponse> getChangePlansByStatus(ChangeStatus status) { return changePlanRepository.findAllByStatus(status).stream().map(this::toResponse).collect(Collectors.toList()); }
    @Override public List<ChangeAuditLogResponse> getAuditLogs(Long changePlanId) {
        findById(changePlanId);
        return auditLogRepository.findAllByChangePlanIdOrderByPerformedAtAsc(changePlanId).stream().map(this::toAuditResponse).collect(Collectors.toList());
    }

    private ChangePlan findById(Long id) {
        return changePlanRepository.findById(id).orElseThrow(() -> new ChangeManagementException("Change plan not found: " + id));
    }

    private void addAuditLog(ChangePlan plan, ChangeStatus from, ChangeStatus to, Long userId, String role, String comment) {
        ChangeAuditLog log = new ChangeAuditLog();
        log.setChangePlan(plan);
        log.setFromStatus(from != null ? from : to);
        log.setToStatus(to);
        log.setPerformedByUserId(userId);
        log.setPerformedByRole(role);
        log.setComment(comment);
        auditLogRepository.save(log);
    }

    private String generateChangeNumber() {
        return String.format("CHG-%s-%03d", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")), changePlanRepository.count() + 1);
    }

    private ChangePlanResponse toResponse(ChangePlan p) {
        ChangePlanResponse r = new ChangePlanResponse();
        r.setId(p.getId());
        r.setChangeNumber(p.getChangeNumber());
        r.setTitle(p.getTitle());
        r.setDescription(p.getDescription());
        r.setChangeType(p.getChangeType());
        r.setPriority(p.getPriority());
        r.setStatus(p.getStatus());
        r.setPlannedStartTime(p.getPlannedStartTime());
        r.setPlannedEndTime(p.getPlannedEndTime());
        r.setSubmittedAt(p.getSubmittedAt());
        r.setDecisionAt(p.getDecisionAt());
        r.setManagerComment(p.getManagerComment());
        r.setRevisionCount(p.getRevisionCount());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        r.setCreatedBySpId(p.getCreatedBySpId());

        try {
            UserEmailResponse spInfo = userServiceClient.getUserById(p.getCreatedBySpId()).getData();
            if (spInfo != null) {
                r.setCreatedBySpName(spInfo.getFullName());
                r.setCreatedBySpEmail(spInfo.getEmail());
            }
        } catch (Exception ex) {
            r.setCreatedBySpName(null);
            r.setCreatedBySpEmail(null);
        }

        return r;
    }

    private ChangeAuditLogResponse toAuditResponse(ChangeAuditLog l) {
        ChangeAuditLogResponse r = new ChangeAuditLogResponse();
        r.setId(l.getId());
        r.setFromStatus(l.getFromStatus());
        r.setToStatus(l.getToStatus());
        r.setPerformedByUserId(l.getPerformedByUserId());
        r.setPerformedByRole(l.getPerformedByRole());
        r.setComment(l.getComment());
        r.setPerformedAt(l.getPerformedAt());

        try {
            UserEmailResponse userInfo = userServiceClient.getUserById(l.getPerformedByUserId()).getData();
            if (userInfo != null) {
                r.setPerformedByUserName(userInfo.getFullName());
            }
        } catch (Exception ex) {
            r.setPerformedByUserName(null);
        }

        return r;
    }
}
