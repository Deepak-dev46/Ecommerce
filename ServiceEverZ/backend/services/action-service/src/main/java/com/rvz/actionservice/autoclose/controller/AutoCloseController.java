package com.rvz.actionservice.autoclose.controller;

import com.rvz.actionservice.autoclose.dto.AutoCloseConfigRequest;
import com.rvz.actionservice.autoclose.dto.AutoCloseConfigResponse;
import com.rvz.actionservice.autoclose.dto.TicketAutoCloseStateResponse;
import com.rvz.actionservice.autoclose.service.AutoCloseService;
import com.rvz.actionservice.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST API for the auto-ticket-closure feature.
 *
 * All /config endpoints must be restricted to ITSM_MANAGER role at the
 * API Gateway / Spring Security layer (same pattern as the rest of your project).
 *
 * Base path: /api/auto-close
 *
 * Endpoints:
 *   POST   /api/auto-close/config                    — upsert global or SLA config
 *   GET    /api/auto-close/config                    — list all configs
 *   GET    /api/auto-close/config/effective?slaId=   — effective config for a ticket
 *   DELETE /api/auto-close/config/{configId}         — remove a config
 *   GET    /api/auto-close/ticket/{ticketId}/state   — timer state for a ticket
 */
@RestController
@RequestMapping("/api/auto-close")
public class AutoCloseController {

    private final AutoCloseService autoCloseService;

    public AutoCloseController(AutoCloseService autoCloseService) {
        this.autoCloseService = autoCloseService;
    }

    // ── Config endpoints ──────────────────────────────────────────────────────

    /**
     * Upsert a config.
     * Body: { "slaId": null, "autoCloseHours": 72 }  → global default
     * Body: { "slaId": 5,    "autoCloseHours": 24 }  → SLA-specific override
     *
     * X-Manager-Id header must carry the authenticated manager's user ID.
     */
    @PostMapping("/config")
    public ResponseEntity<ApiResponse<AutoCloseConfigResponse>> upsertConfig(
            @Valid @RequestBody AutoCloseConfigRequest request,
            @RequestHeader("X-Manager-Id") Long managerId) {

        AutoCloseConfigResponse data = autoCloseService.upsertConfig(request, managerId);
        ApiResponse<AutoCloseConfigResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Auto-close config saved successfully.");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<List<AutoCloseConfigResponse>>> getAllConfigs() {
        List<AutoCloseConfigResponse> data = autoCloseService.getAllConfigs();
        ApiResponse<List<AutoCloseConfigResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Configs fetched.");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * Returns the effective config for a given slaId.
     * Pass slaId=null (omit param) to query the global default.
     */
    @GetMapping("/config/effective")
    public ResponseEntity<ApiResponse<AutoCloseConfigResponse>> getEffectiveConfig(
            @RequestParam(required = false) Long slaId) {

        AutoCloseConfigResponse data = autoCloseService.getEffectiveConfig(slaId);
        ApiResponse<AutoCloseConfigResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Effective config fetched.");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/config/{configId}")
    public ResponseEntity<ApiResponse<Void>> deleteConfig(@PathVariable Long configId) {
        autoCloseService.deleteConfig(configId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Config deleted.");
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    // ── State query ───────────────────────────────────────────────────────────

    @GetMapping("/ticket/{ticketId}/state")
    public ResponseEntity<ApiResponse<TicketAutoCloseStateResponse>> getTicketState(
            @PathVariable Long ticketId) {

        TicketAutoCloseStateResponse data = autoCloseService.getStateForTicket(ticketId);
        ApiResponse<TicketAutoCloseStateResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Auto-close state fetched.");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
