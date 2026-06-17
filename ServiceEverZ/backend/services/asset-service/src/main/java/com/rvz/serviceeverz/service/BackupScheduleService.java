package com.rvz.serviceeverz.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.rvz.serviceeverz.dto.request.CreateBackupScheduleRequest;
import com.rvz.serviceeverz.dto.request.UpdateBackupScheduleRequest;
import com.rvz.serviceeverz.dto.response.BackupScheduleResponse;
import com.rvz.serviceeverz.dto.response.UserSummaryResponse;
import com.rvz.serviceeverz.entity.BackupSchedule;
import com.rvz.serviceeverz.enums.BackupFrequency;
import com.rvz.serviceeverz.enums.BackupStatus;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.notification.AssetNotificationService;
import com.rvz.serviceeverz.repository.AssetRepository;
import com.rvz.serviceeverz.repository.BackupScheduleRepository;
import com.rvz.serviceeverz.repository.RetentionPolicyRepository;

@Service
public class BackupScheduleService {

    private static final Logger log = LoggerFactory.getLogger(BackupScheduleService.class);

    private final BackupScheduleRepository backupScheduleRepository;
    private final RetentionPolicyRepository retentionPolicyRepository;
    private final AssetRepository assetRepository;
    private final AssetNotificationService notificationService;
    private final UserServiceClient userServiceClient;

    public BackupScheduleService(BackupScheduleRepository backupScheduleRepository,
                                  RetentionPolicyRepository retentionPolicyRepository,
                                  AssetRepository assetRepository,
                                  AssetNotificationService notificationService,
                                  UserServiceClient userServiceClient) {
        this.backupScheduleRepository = backupScheduleRepository;
        this.retentionPolicyRepository = retentionPolicyRepository;
        this.assetRepository = assetRepository;
        this.notificationService = notificationService;
        this.userServiceClient = userServiceClient;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    public BackupScheduleResponse createSchedule(CreateBackupScheduleRequest request) {
        if (request.getRetentionPolicyId() != null) {
            retentionPolicyRepository.findById(request.getRetentionPolicyId())
                .orElseThrow(() -> new RuntimeException(
                    "Retention policy not found with id: " + request.getRetentionPolicyId()));
        }

        if (request.getScheduledDate() != null && !request.getScheduledDate().isAfter(LocalDate.now())) {
            throw new IllegalStateException("Scheduled date must be a future date");
        }

        BackupSchedule schedule = new BackupSchedule();
        schedule.setScheduleName(request.getScheduleName());
        schedule.setDescription(request.getDescription());
        schedule.setFrequency(request.getFrequency());
        schedule.setAssetId(request.getAssetId());
        schedule.setRetentionPolicyId(request.getRetentionPolicyId());
        schedule.setScheduledDate(request.getScheduledDate());
        schedule.setCreatedBySpId(request.getCreatedBySpId());
        schedule.setStatus(BackupStatus.SCHEDULED);
        // nextBackupDate starts as the scheduledDate
        schedule.setNextBackupDate(request.getScheduledDate());

        BackupSchedule saved = backupScheduleRepository.save(schedule);
        BackupScheduleResponse response = mapToResponse(saved);

        // Send mail notification asynchronously
        try {
            String spName = resolveUserName(saved.getCreatedBySpId());
            String assetName = response.getAssetName();
            String policyName = response.getRetentionPolicyName();
            notificationService.notifyBackupScheduled(saved, spName, assetName, policyName);
        } catch (Exception e) {
            log.warn("Failed to send backup-scheduled notification: {}", e.getMessage());
        }

        return response;
    }

    // ── GET ALL ───────────────────────────────────────────────────────────────
    public List<BackupScheduleResponse> getAllSchedules() {
        return backupScheduleRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    public BackupScheduleResponse getScheduleById(Long id) {
        return mapToResponse(findById(id));
    }

    // ── GET BY STATUS ─────────────────────────────────────────────────────────
    public List<BackupScheduleResponse> getSchedulesByStatus(BackupStatus status) {
        return backupScheduleRepository.findAllByStatus(status)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET BY ASSET ──────────────────────────────────────────────────────────
    public List<BackupScheduleResponse> getSchedulesByAsset(Long assetId) {
        return backupScheduleRepository.findAllByAssetId(assetId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET GENERIC BACKUPS ONLY ──────────────────────────────────────────────
    public List<BackupScheduleResponse> getGenericSchedules() {
        return backupScheduleRepository.findAllByAssetIdIsNull()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET ASSET-SPECIFIC BACKUPS ONLY ──────────────────────────────────────
    public List<BackupScheduleResponse> getAssetSpecificSchedules() {
        return backupScheduleRepository.findAllByAssetIdIsNotNull()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET UPCOMING SCHEDULES (SCHEDULED status with future date) ────────────
    public List<BackupScheduleResponse> getUpcomingSchedules() {
        return backupScheduleRepository.findAllByStatusAndScheduledDateAfter(
                BackupStatus.SCHEDULED, LocalDate.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET SCHEDULES WITH NEXT BACKUP WITHIN 10 DAYS (date-wise) ────────────
    /**
     * Returns all schedules whose nextBackupDate falls within the next
     * {@code days} days (default 10), ordered by nextBackupDate ascending.
     * Useful for the "nearing backup" reminder view.
     */
    public List<BackupScheduleResponse> getSchedulesDueWithinDays(int days) {
        LocalDate from = LocalDate.now();
        LocalDate to   = from.plusDays(days);
        return backupScheduleRepository.findAllByNextBackupDateBetween(from, to)
                .stream()
                .sorted((a, b) -> {
                    if (a.getNextBackupDate() == null) return 1;
                    if (b.getNextBackupDate() == null) return -1;
                    return a.getNextBackupDate().compareTo(b.getNextBackupDate());
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── GET ALL SCHEDULES ORDERED BY NEXT BACKUP DATE ─────────────────────────
    public List<BackupScheduleResponse> getAllSchedulesByNextBackupDate() {
        return backupScheduleRepository.findAllByOrderByNextBackupDateAsc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    public BackupScheduleResponse updateSchedule(Long id, UpdateBackupScheduleRequest request) {
        BackupSchedule schedule = findById(id);
        BackupStatus previousStatus = schedule.getStatus();

        if (request.getScheduleName() != null) schedule.setScheduleName(request.getScheduleName());
        if (request.getDescription()  != null) schedule.setDescription(request.getDescription());
        if (request.getFrequency()    != null) schedule.setFrequency(request.getFrequency());
        if (request.getAssetId()      != null) schedule.setAssetId(request.getAssetId());
        if (request.getStatus()       != null) schedule.setStatus(request.getStatus());

        // Only validate future date when status is still SCHEDULED
        if (request.getScheduledDate() != null) {
            BackupStatus effectiveStatus = request.getStatus() != null ? request.getStatus() : schedule.getStatus();
            if (effectiveStatus == BackupStatus.SCHEDULED
                    && !request.getScheduledDate().isAfter(LocalDate.now())) {
                throw new IllegalStateException("Scheduled date must be a future date");
            }
            schedule.setScheduledDate(request.getScheduledDate());
            // Keep nextBackupDate in sync when scheduledDate changes and backup not yet completed
            if (schedule.getNextBackupDate() == null) {
                schedule.setNextBackupDate(request.getScheduledDate());
            }
        }

        if (request.getRetentionPolicyId() != null) {
            retentionPolicyRepository.findById(request.getRetentionPolicyId())
                .orElseThrow(() -> new RuntimeException(
                    "Retention policy not found with id: " + request.getRetentionPolicyId()));
            schedule.setRetentionPolicyId(request.getRetentionPolicyId());
        }
        if (request.getClearRetentionPolicy() != null && request.getClearRetentionPolicy()) {
            schedule.setRetentionPolicyId(null);
        }

        // When status transitions to BACKUP_COMPLETED, compute the next backup date
        BackupStatus newStatus = schedule.getStatus();
        if (newStatus == BackupStatus.BACKUP_COMPLETED && previousStatus != BackupStatus.BACKUP_COMPLETED) {
            LocalDate base = schedule.getScheduledDate() != null ? schedule.getScheduledDate() : LocalDate.now();
            schedule.setNextBackupDate(computeNextBackupDate(base, schedule.getFrequency()));
        }

        BackupSchedule saved = backupScheduleRepository.save(schedule);
        BackupScheduleResponse response = mapToResponse(saved);

        // Fire status-change notifications asynchronously
        if (request.getStatus() != null && request.getStatus() != previousStatus) {
            try {
                String spName    = resolveUserName(saved.getCreatedBySpId());
                String assetName = response.getAssetName();
                String policy    = response.getRetentionPolicyName();

                if (newStatus == BackupStatus.BACKUP_INITIATED) {
                    notificationService.notifyBackupInitiated(saved, spName, assetName);
                } else if (newStatus == BackupStatus.BACKUP_COMPLETED) {
                    notificationService.notifyBackupCompleted(saved, spName, assetName, policy);
                }
            } catch (Exception e) {
                log.warn("Failed to send backup status-change notification: {}", e.getMessage());
            }
        }

        return response;
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    public void deleteSchedule(Long id) {
        backupScheduleRepository.delete(findById(id));
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private BackupSchedule findById(Long id) {
        return backupScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup schedule not found with id: " + id));
    }

    /**
     * Computes the next backup date based on the current backup date and frequency.
     */
    private LocalDate computeNextBackupDate(LocalDate from, BackupFrequency frequency) {
        if (frequency == null) return from.plusDays(30);
        switch (frequency) {
            case HOURLY:  return from.plusDays(1);   // hourly means next day for scheduling
            case DAILY:   return from.plusDays(1);
            case WEEKLY:  return from.plusWeeks(1);
            case MONTHLY: return from.plusMonths(1);
            default:      return from.plusDays(30);
        }
    }

    private String resolveUserName(Long userId) {
        if (userId == null) return "Support Personnel";
        try {
            UserSummaryResponse user = userServiceClient.getUserById(userId);
            if (user != null && user.getFullName() != null && !user.getFullName().isBlank()) {
                return user.getFullName();
            }
        } catch (Exception e) {
            log.warn("Could not resolve name for userId={}: {}", userId, e.getMessage());
        }
        return "Support Personnel";
    }

    private BackupScheduleResponse mapToResponse(BackupSchedule schedule) {
        BackupScheduleResponse response = new BackupScheduleResponse();
        response.setId(schedule.getId());
        response.setScheduleName(schedule.getScheduleName());
        response.setDescription(schedule.getDescription());
        response.setFrequency(schedule.getFrequency());
        response.setAssetId(schedule.getAssetId());
        response.setRetentionPolicyId(schedule.getRetentionPolicyId());
        response.setStatus(schedule.getStatus());
        response.setScheduledDate(schedule.getScheduledDate());
        response.setNextBackupDate(schedule.getNextBackupDate());
        response.setCreatedBySpId(schedule.getCreatedBySpId());
        response.setCreatedAt(schedule.getCreatedAt());
        response.setUpdatedAt(schedule.getUpdatedAt());

        // Hydrate SP name
        if (schedule.getCreatedBySpId() != null) {
            response.setCreatedBySpName(resolveUserName(schedule.getCreatedBySpId()));
        }

        // Hydrate asset name when assetId is set
        if (schedule.getAssetId() != null) {
            try {
                assetRepository.findById(schedule.getAssetId()).ifPresent(asset -> {
                    response.setAssetName(asset.getName());
                    response.setAssetTag(asset.getAssetTag());
                });
            } catch (Exception ignored) {
                // Non-blocking: if asset lookup fails, leave assetName null
            }
        }

        // Hydrate inline retention policy details
        if (schedule.getRetentionPolicyId() != null) {
            try {
                retentionPolicyRepository.findById(schedule.getRetentionPolicyId())
                    .ifPresent(policy -> {
                        response.setRetentionPolicyName(policy.getPolicyName());
                        response.setRetentionPolicyType(
                            policy.getType() != null ? policy.getType().name() : null);
                        response.setRetentionPolicyFrequency(
                            policy.getFrequency() != null ? policy.getFrequency().name() : null);
                        response.setRetentionPolicyDays(policy.getRetentionDays());
                        response.setRetentionPolicyActive(policy.getIsActive());
                    });
            } catch (Exception ignored) {
                // Non-blocking: if policy lookup fails, leave fields null
            }
        }

        return response;
    }
}
