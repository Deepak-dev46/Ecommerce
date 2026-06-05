package com.rvz.serviceeverz.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.BackupSchedule;
import com.rvz.serviceeverz.enums.BackupStatus;

@Repository
public interface BackupScheduleRepository extends JpaRepository<BackupSchedule, Long> {

	 List<BackupSchedule> findAllByCreatedBySpId(Long spId);

	    // Filter by backup status
	    List<BackupSchedule> findAllByStatus(BackupStatus status);

	    // All schedules for a specific asset
	    List<BackupSchedule> findAllByAssetId(Long assetId);

	    // Only generic backups (no asset linked)
	    List<BackupSchedule> findAllByAssetIdIsNull();

	    // Only asset-specific backups
	    List<BackupSchedule> findAllByAssetIdIsNotNull();
}
