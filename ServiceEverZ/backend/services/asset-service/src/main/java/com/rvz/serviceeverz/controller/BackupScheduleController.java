package com.rvz.serviceeverz.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rvz.serviceeverz.dto.request.CreateBackupScheduleRequest;
import com.rvz.serviceeverz.dto.request.UpdateBackupScheduleRequest;
import com.rvz.serviceeverz.dto.response.BackupScheduleResponse;
import com.rvz.serviceeverz.enums.BackupStatus;
import com.rvz.serviceeverz.service.BackupScheduleService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/assets/data-management/backup-schedules")
public class BackupScheduleController {

    private final BackupScheduleService backupScheduleService;

    public BackupScheduleController(BackupScheduleService backupScheduleService) {
		super();
		this.backupScheduleService = backupScheduleService;
	}

	// POST /api/assets/data-management/backup-schedules
    @PostMapping
    public ResponseEntity<BackupScheduleResponse> create(
            @Valid @RequestBody CreateBackupScheduleRequest request) {
        return ResponseEntity.ok(backupScheduleService.createSchedule(request));
    }

    // GET /api/assets/data-management/backup-schedules
    @GetMapping
    public ResponseEntity<List<BackupScheduleResponse>> getAll() {
        return ResponseEntity.ok(backupScheduleService.getAllSchedules());
    }

    // GET /api/assets/data-management/backup-schedules/{id}
    @GetMapping("/{id}")
    public ResponseEntity<BackupScheduleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(backupScheduleService.getScheduleById(id));
    }

    // GET /api/assets/data-management/backup-schedules/sp/{spId}
    @GetMapping("/sp/{spId}")
    public ResponseEntity<List<BackupScheduleResponse>> getBySp(@PathVariable Long spId) {
        return ResponseEntity.ok(backupScheduleService.getSchedulesBySp(spId));
    }

    // GET /api/assets/data-management/backup-schedules/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BackupScheduleResponse>> getByStatus(@PathVariable BackupStatus status) {
        return ResponseEntity.ok(backupScheduleService.getSchedulesByStatus(status));
    }

    // GET /api/assets/data-management/backup-schedules/asset/{assetId}
    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<BackupScheduleResponse>> getByAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(backupScheduleService.getSchedulesByAsset(assetId));
    }

    // GET /api/assets/data-management/backup-schedules/generic
    @GetMapping("/generic")
    public ResponseEntity<List<BackupScheduleResponse>> getGeneric() {
        return ResponseEntity.ok(backupScheduleService.getGenericSchedules());
    }

    // GET /api/assets/data-management/backup-schedules/asset-specific
    @GetMapping("/asset-specific")
    public ResponseEntity<List<BackupScheduleResponse>> getAssetSpecific() {
        return ResponseEntity.ok(backupScheduleService.getAssetSpecificSchedules());
    }

    // PUT /api/assets/data-management/backup-schedules/{id}
    @PutMapping("/{id}")
    public ResponseEntity<BackupScheduleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBackupScheduleRequest request) {
        return ResponseEntity.ok(backupScheduleService.updateSchedule(id, request));
    }

    // DELETE /api/assets/data-management/backup-schedules/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        backupScheduleService.deleteSchedule(id);
        return ResponseEntity.ok("Backup schedule deleted successfully");
    }
}
