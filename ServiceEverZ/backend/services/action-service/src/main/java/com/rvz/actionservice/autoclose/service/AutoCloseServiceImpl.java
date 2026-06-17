package com.rvz.actionservice.autoclose.service;

import com.rvz.actionservice.autoclose.dto.AutoCloseConfigRequest;
import com.rvz.actionservice.autoclose.dto.AutoCloseConfigResponse;
import com.rvz.actionservice.autoclose.dto.TicketAutoCloseStateResponse;
import com.rvz.actionservice.autoclose.entity.AutoCloseConfig;
import com.rvz.actionservice.autoclose.entity.TicketAutoCloseState;
import com.rvz.actionservice.autoclose.enums.AutoCloseStatus;
import com.rvz.actionservice.autoclose.repository.AutoCloseConfigRepository;
import com.rvz.actionservice.autoclose.repository.TicketAutoCloseStateRepository;
import com.rvz.actionservice.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AutoCloseServiceImpl implements AutoCloseService {

    private static final Logger log = LoggerFactory.getLogger(AutoCloseServiceImpl.class);

    private final AutoCloseConfigRepository configRepository;
    private final TicketAutoCloseStateRepository stateRepository;

    public AutoCloseServiceImpl(AutoCloseConfigRepository configRepository,
                                TicketAutoCloseStateRepository stateRepository) {
        this.configRepository = configRepository;
        this.stateRepository  = stateRepository;
    }

    // =========================================================================
    // Configuration management
    // =========================================================================

    @Override
    @Transactional
    public AutoCloseConfigResponse upsertConfig(AutoCloseConfigRequest request, Long managerId) {
        AutoCloseConfig config;

        if (request.getSlaId() == null) {
            config = configRepository.findBySlaIdIsNull().orElse(new AutoCloseConfig());
        } else {
            config = configRepository.findBySlaId(request.getSlaId())
                    .orElse(new AutoCloseConfig());
            config.setSlaId(request.getSlaId());
        }

        if (config.getId() == null) {
            config.setCreatedBy(managerId);
            config.setCreatedAt(LocalDateTime.now());
        }
        config.setAutoCloseHours(request.getAutoCloseHours());
        config.setEnabled(request.isEnabled());
        config.setUpdatedAt(LocalDateTime.now());

        AutoCloseConfig saved = configRepository.save(config);
        log.info("Auto-close config saved: id={}, slaId={}, hours={}, enabled={}",
                saved.getId(), saved.getSlaId(), saved.getAutoCloseHours(), saved.isEnabled());
        return AutoCloseConfigResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AutoCloseConfigResponse> getAllConfigs() {
        return configRepository.findAll().stream()
                .map(AutoCloseConfigResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AutoCloseConfigResponse getEffectiveConfig(Long slaId) {
        return configRepository.findEffectiveConfig(slaId)
                .map(AutoCloseConfigResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No auto-close configuration found. Configure a global default first."));
    }

    @Override
    @Transactional
    public void deleteConfig(Long configId) {
        configRepository.deleteById(configId);
        log.info("Auto-close config deleted: id={}", configId);
    }

    // =========================================================================
    // Ticket lifecycle hooks
    // =========================================================================

    @Override
    @Transactional
    public void onTicketResolved(Long ticketId, Long slaId) {
        Optional<AutoCloseConfig> configOpt = configRepository.findEffectiveConfig(slaId);

        if (configOpt.isEmpty() || !configOpt.get().isEnabled()) {
            log.debug("Auto-close not configured/disabled for ticketId={}, slaId={}. Skipping.", ticketId, slaId);
            return;
        }

        int hours = configOpt.get().getAutoCloseHours();
        Optional<TicketAutoCloseState> existingOpt = stateRepository.findByTicketId(ticketId);

        if (existingOpt.isPresent()) {
            TicketAutoCloseState existing = existingOpt.get();

            // Guard: if already auto-closed (shouldn't happen if reopen guard is working)
            if (existing.getStatus() == AutoCloseStatus.CLOSED) {
                log.warn("Ticket {} is already in CLOSED auto-close state. Ignoring resolve event.", ticketId);
                return;
            }
            // Restart timer (handles re-resolve after reopen)
            existing.restartTimer(hours);
            stateRepository.save(existing);
            log.info("Auto-close timer RESTARTED for ticketId={}, scheduledCloseAt={}",
                    ticketId, existing.getScheduledCloseAt());
        } else {
            TicketAutoCloseState state = new TicketAutoCloseState(ticketId, slaId, hours);
            stateRepository.save(state);
            log.info("Auto-close timer STARTED for ticketId={}, scheduledCloseAt={}",
                    ticketId, state.getScheduledCloseAt());
        }
    }

    @Override
    @Transactional
    public void onTicketReopened(Long ticketId) {
        Optional<TicketAutoCloseState> stateOpt = stateRepository.findByTicketId(ticketId);

        if (stateOpt.isEmpty()) {
            log.debug("No auto-close state for ticketId={}. Nothing to cancel.", ticketId);
            return;
        }

        TicketAutoCloseState state = stateOpt.get();

        if (state.getStatus() == AutoCloseStatus.PENDING) {
            state.cancelTimer();
            stateRepository.save(state);
            log.info("Auto-close timer CANCELLED for ticketId={} (reopen #{})",
                    ticketId, state.getReopenCount());
        } else {
            log.debug("Auto-close state for ticketId={} is {}. No action needed.",
                    ticketId, state.getStatus());
        }
    }

    // =========================================================================
    // State query
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public TicketAutoCloseStateResponse getStateForTicket(Long ticketId) {
        TicketAutoCloseState state = stateRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No auto-close state found for ticketId: " + ticketId));
        return TicketAutoCloseStateResponse.from(state);
    }
}
