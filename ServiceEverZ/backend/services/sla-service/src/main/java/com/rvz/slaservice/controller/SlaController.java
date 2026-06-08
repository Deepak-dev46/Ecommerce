package com.rvz.slaservice.controller;

import com.rvz.slaservice.dto.ApiResponse;
import com.rvz.slaservice.dto.request.StartSlaRequest;
import com.rvz.slaservice.dto.request.TicketActionRequest;
import com.rvz.slaservice.dto.response.SlaResponse;
import com.rvz.slaservice.service.SlaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/sla")
@CrossOrigin(origins="http://localhost:3000/")
public class SlaController {
    private final SlaService slaService;

    public SlaController(SlaService slaService) {
        this.slaService = slaService;
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<SlaResponse>> start(@Valid @RequestBody StartSlaRequest request) {
        SlaResponse data = slaService.startSla(request);
        ApiResponse<SlaResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("SLA started successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/hold")
    public ResponseEntity<ApiResponse<SlaResponse>> hold(@Valid @RequestBody TicketActionRequest request) {
        SlaResponse data = slaService.putOnHold(request);
        ApiResponse<SlaResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("SLA put on hold successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<SlaResponse>> release(@Valid @RequestBody TicketActionRequest request) {
        SlaResponse data = slaService.releaseOnHold(request);
        ApiResponse<SlaResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("SLA resumed successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<SlaResponse>> complete(@Valid @RequestBody TicketActionRequest request) {
        SlaResponse data = slaService.completeSla(request);
        ApiResponse<SlaResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("SLA completed successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ticketId}/breach")
    public ResponseEntity<ApiResponse<SlaResponse>> breach(@PathVariable Long ticketId) {
        SlaResponse data = slaService.checkBreach(ticketId);
        ApiResponse<SlaResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("SLA breach checked successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<SlaResponse>> get(@PathVariable Long ticketId) {
        SlaResponse data = slaService.getSla(ticketId);
        ApiResponse<SlaResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("SLA fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        ApiResponse<String> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("SLA Service is running");
        response.setData("UP");
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
