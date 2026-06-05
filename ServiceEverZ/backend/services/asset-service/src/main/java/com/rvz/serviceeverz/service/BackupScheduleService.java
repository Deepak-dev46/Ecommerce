package com.rvz.serviceeverz.service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rvz.serviceeverz.dto.request.CreateBackupScheduleRequest;
import com.rvz.serviceeverz.dto.request.UpdateBackupScheduleRequest;
import com.rvz.serviceeverz.dto.response.BackupScheduleResponse;
import com.rvz.serviceeverz.entity.BackupSchedule;
import com.rvz.serviceeverz.enums.BackupStatus;
import com.rvz.serviceeverz.repository.BackupScheduleRepository;

@Service
public class BackupScheduleService {

    public BackupScheduleService(BackupScheduleRepository backupScheduleRepository) {
		super();
		this.backupScheduleRepository = backupScheduleRepository;
	}

	private final BackupScheduleRepository backupScheduleRepository;

    // ── CREATE ────────────────────────────────────────────────────────────────
    public BackupScheduleResponse createSchedule(CreateBackupScheduleRequest request) {
        BackupSchedule schedule = new BackupSchedule();
        schedule.setScheduleName(request.getScheduleName());
        schedule.setDescription(request.getDescription());
        schedule.setAssetId(request.getAssetId());           // null = generic, value = asset-specific
        schedule.setFrequency(request.getFrequency());
        schedule.setNextBackupAt(request.getNextBackupAt());
        schedule.setStatus(BackupStatus.SCHEDULED);
        schedule.setBackupLocation(request.getBackupLocation());
        schedule.setCreatedBySpId(request.getCreatedBySpId());

        return mapToResponse(backupScheduleRepository.save(schedule));
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

    // ── GET BY SP ─────────────────────────────────────────────────────────────
    public List<BackupScheduleResponse> getSchedulesBySp(Long spId) {
        return backupScheduleRepository.findAllByCreatedBySpId(spId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET BY STATUS ─────────────────────────────────────────────────────────
    public List<BackupScheduleResponse> getSchedulesByStatus(BackupStatus status) {
        return backupScheduleRepository.findAllByStatus(status)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── GET BY ASSET (asset-specific backups) ─────────────────────────────────
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

    // ── UPDATE ────────────────────────────────────────────────────────────────
    public BackupScheduleResponse updateSchedule(Long id, UpdateBackupScheduleRequest request) {
        BackupSchedule schedule = findById(id);

        if (request.getScheduleName() != null) schedule.setScheduleName(request.getScheduleName());
        if (request.getDescription() != null) schedule.setDescription(request.getDescription());
        if (request.getAssetId() != null) schedule.setAssetId(request.getAssetId());
        if (request.getFrequency() != null) schedule.setFrequency(request.getFrequency());
        if (request.getNextBackupAt() != null) schedule.setNextBackupAt(request.getNextBackupAt());
        if (request.getStatus() != null) {
            schedule.setStatus(request.getStatus());
            if (request.getStatus() == BackupStatus.COMPLETED) {
                schedule.setLastBackupAt(LocalDateTime.now());
            }
        }
        if (request.getBackupLocation() != null) schedule.setBackupLocation(request.getBackupLocation());

        return mapToResponse(backupScheduleRepository.save(schedule));
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

    private BackupScheduleResponse mapToResponse(BackupSchedule schedule) {
        BackupScheduleResponse response = new BackupScheduleResponse();
        response.setId(schedule.getId());
        response.setScheduleName(schedule.getScheduleName());
        response.setDescription(schedule.getDescription());
        response.setAssetId(schedule.getAssetId());
        response.setFrequency(schedule.getFrequency());
        response.setNextBackupAt(schedule.getNextBackupAt());
        response.setLastBackupAt(schedule.getLastBackupAt());
        response.setStatus(schedule.getStatus());
        response.setBackupLocation(schedule.getBackupLocation());
        response.setCreatedBySpId(schedule.getCreatedBySpId());
        response.setCreatedAt(schedule.getCreatedAt());
        response.setUpdatedAt(schedule.getUpdatedAt());
        return response;
    }
}
