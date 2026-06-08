package com.rvz.serviceeverz.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rvz.serviceeverz.dto.request.FreezeWindowRequest;
import com.rvz.serviceeverz.dto.response.FreezeWindowResponse;
import com.rvz.serviceeverz.dto.response.UserEmailResponse;
import com.rvz.serviceeverz.entity.FreezeWindow;
import com.rvz.serviceeverz.exception.ChangeManagementException;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.repository.FreezeWindowRepository;
import com.rvz.serviceeverz.service.EmailComposerService;
import com.rvz.serviceeverz.service.FreezeWindowService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FreezeWindowServiceImpl implements FreezeWindowService {

    private final FreezeWindowRepository freezeWindowRepository;
    private final EmailComposerService emailComposerService;
    private final UserServiceClient userServiceClient;

    public FreezeWindowServiceImpl(FreezeWindowRepository freezeWindowRepository,
                                    EmailComposerService emailComposerService,
                                    UserServiceClient userServiceClient) {
        this.freezeWindowRepository = freezeWindowRepository;
        this.emailComposerService = emailComposerService;
        this.userServiceClient = userServiceClient;
    }

    @Override
    @Transactional
    public FreezeWindowResponse createFreezeWindow(FreezeWindowRequest request) {
        if (request.getFreezeEnd().isBefore(request.getFreezeStart())) {
            throw new ChangeManagementException("Freeze end must be after freeze start.");
        }
        FreezeWindow fw = new FreezeWindow();
        fw.setReason(request.getReason());
        fw.setFreezeStart(request.getFreezeStart());
        fw.setFreezeEnd(request.getFreezeEnd());
        fw.setCreatedByManagerId(request.getCreatedByManagerId());
        fw.setNotificationSent(false);
        FreezeWindow saved = freezeWindowRepository.save(fw);

        List<UserEmailResponse> allUsers = userServiceClient.getAllUsers().getData();
        List<String> allEmails = (allUsers != null ? allUsers.stream() : java.util.stream.Stream.<UserEmailResponse>empty())
            .filter(u -> u.getEmail() != null && !u.getEmail().isBlank())
            .map(UserEmailResponse::getEmail)
            .collect(Collectors.toList());

        emailComposerService.sendFreezeWindowNotification(allEmails, saved);

        saved.setNotificationSent(true);
        freezeWindowRepository.save(saved);
        return toResponse(saved);
    }

    @Override
    public List<FreezeWindowResponse> getAllFreezeWindows() {
        return freezeWindowRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<FreezeWindowResponse> getActiveFreezeWindows() {
        return freezeWindowRepository.findActiveFreezeWindows(LocalDateTime.now())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFreezeWindow(Long id) {
        FreezeWindow fw = freezeWindowRepository.findById(id)
            .orElseThrow(() -> new ChangeManagementException("Freeze window not found: " + id));
        freezeWindowRepository.delete(fw);
    }

    private FreezeWindowResponse toResponse(FreezeWindow fw) {
        FreezeWindowResponse r = new FreezeWindowResponse();
        r.setId(fw.getId());
        r.setReason(fw.getReason());
        r.setFreezeStart(fw.getFreezeStart());
        r.setFreezeEnd(fw.getFreezeEnd());
        r.setCreatedByManagerId(fw.getCreatedByManagerId());
        r.setNotificationSent(fw.getNotificationSent());
        r.setCreatedAt(fw.getCreatedAt());
     
        try {
            UserEmailResponse managerInfo = userServiceClient.getUserById(fw.getCreatedByManagerId()).getData();
            if (managerInfo != null) {
                r.setCreatedByManagerName(managerInfo.getFullName());
            }
        } catch (Exception ex) {
            r.setCreatedByManagerName(null);
        }
     
        return r;
    }
     
}
