package com.rvz.serviceeverz.config;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.rvz.serviceeverz.dto.response.UserSummaryResponse;
import com.rvz.serviceeverz.entity.BackupSchedule;
import com.rvz.serviceeverz.feign.UserServiceClient;
import com.rvz.serviceeverz.notification.AssetNotificationService;
import com.rvz.serviceeverz.repository.AssetRepository;
import com.rvz.serviceeverz.repository.BackupScheduleRepository;

/**
 * Scheduled job that runs daily at 8:00 AM and sends reminder emails
 * to the responsible Support Personnel for any backup whose nextBackupDate
 * is within the next 10 days.
 */
@Component
public class BackupReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(BackupReminderScheduler.class);
    private static final int REMINDER_DAYS = 10;

    private final BackupScheduleRepository backupScheduleRepository;
    private final AssetRepository assetRepository;
    private final AssetNotificationService notificationService;
    private final UserServiceClient userServiceClient;

    public BackupReminderScheduler(BackupScheduleRepository backupScheduleRepository,
                                    AssetRepository assetRepository,
                                    AssetNotificationService notificationService,
                                    UserServiceClient userServiceClient) {
        this.backupScheduleRepository = backupScheduleRepository;
        this.assetRepository = assetRepository;
        this.notificationService = notificationService;
        this.userServiceClient = userServiceClient;
    }

    /** Runs every day at 8:00 AM. */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendBackupReminderNotifications() {
        LocalDate today = LocalDate.now();
        LocalDate threshold = today.plusDays(REMINDER_DAYS);

        List<BackupSchedule> nearing = backupScheduleRepository
                .findAllByNextBackupDateBetween(today, threshold);

        log.info("Backup reminder check: {} schedules have nextBackupDate within {} days",
                nearing.size(), REMINDER_DAYS);

        for (BackupSchedule schedule : nearing) {
            try {
                if (schedule.getNextBackupDate() == null || schedule.getCreatedBySpId() == null) continue;

                int daysLeft = (int) (schedule.getNextBackupDate().toEpochDay() - today.toEpochDay());
                String spName = resolveUserName(schedule.getCreatedBySpId());
                String assetName = resolveAssetName(schedule.getAssetId());

                notificationService.notifyBackupUpcomingReminder(schedule, spName, assetName, daysLeft);
                log.info("Reminder sent for schedule id={} (nextBackupDate={}, daysLeft={})",
                        schedule.getId(), schedule.getNextBackupDate(), daysLeft);
            } catch (Exception e) {
                log.error("Failed to send reminder for schedule id={}: {}", schedule.getId(), e.getMessage());
            }
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
            log.warn("Could not resolve SP name for userId={}: {}", userId, e.getMessage());
        }
        return "Support Personnel";
    }

    private String resolveAssetName(Long assetId) {
        if (assetId == null) return "—";
        try {
            return assetRepository.findById(assetId)
                    .map(a -> a.getName() + " (" + a.getAssetTag() + ")")
                    .orElse("—");
        } catch (Exception e) {
            return "—";
        }
    }
}
