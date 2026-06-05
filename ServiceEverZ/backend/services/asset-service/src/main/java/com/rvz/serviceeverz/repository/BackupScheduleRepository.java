package com.rvz.serviceeverz.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.BackupSchedule;
import com.rvz.serviceeverz.enums.BackupStatus;

@Repository
public interface BackupScheduleRepository extends JpaRepository<BackupSchedule, Long> {

    List<BackupSchedule> findAllByStatus(BackupStatus status);

    List<BackupSchedule> findAllByAssetId(Long assetId);

    List<BackupSchedule> findAllByAssetIdIsNull();

    List<BackupSchedule> findAllByAssetIdIsNotNull();

    // Upcoming: SCHEDULED status with a future scheduledDate
    List<BackupSchedule> findAllByStatusAndScheduledDateAfter(BackupStatus status, LocalDate date);

    // Backups scheduled within the next N days (for "nearing" reminder logic)
    List<BackupSchedule> findAllByStatusAndNextBackupDateBetween(
            BackupStatus status, LocalDate from, LocalDate to);

    // All schedules with a nextBackupDate in a given range regardless of status
    List<BackupSchedule> findAllByNextBackupDateBetween(LocalDate from, LocalDate to);

    // Ordered by nextBackupDate ascending — used for date-wise listing
    List<BackupSchedule> findAllByOrderByNextBackupDateAsc();

    List<BackupSchedule> findAllByStatusOrderByScheduledDateAsc(BackupStatus status);
}
