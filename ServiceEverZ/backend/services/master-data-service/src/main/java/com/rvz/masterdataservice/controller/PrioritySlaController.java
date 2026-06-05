package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import com.rvz.masterdataservice.dto.response.ComplexityEffortResponse;
import com.rvz.masterdataservice.dto.response.PrioritySlaResponse;
import com.rvz.masterdataservice.service.MasterDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/master")
@CrossOrigin(origins="http://localhost:5173/")
public class PrioritySlaController {

    private static final Logger log = LoggerFactory.getLogger(PrioritySlaController.class);

    private final MasterDataService masterDataService;

    public PrioritySlaController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping("/priority-sla")
    public ResponseEntity<ApiResponse<List<PrioritySlaResponse>>> getAllPrioritySla() {
        log.info("GET /api/master/priority-sla");
        List<PrioritySlaResponse> data = masterDataService.getAllPrioritySla();
        ApiResponse<List<PrioritySlaResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Priority SLA configurations fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/priority-sla/{id}")
    public ResponseEntity<ApiResponse<PrioritySlaResponse>> getPriorityById(
            @PathVariable Integer id) {
        log.info("GET /api/master/priority-sla/{}", id);
        PrioritySlaResponse data = masterDataService.getPriorityById(id);
        ApiResponse<PrioritySlaResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Priority fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/complexity")
    public ResponseEntity<ApiResponse<List<ComplexityEffortResponse>>> getAllComplexity() {
        log.info("GET /api/master/complexity");
        List<ComplexityEffortResponse> data = masterDataService.getAllComplexityEffort();
        ApiResponse<List<ComplexityEffortResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Complexity effort configurations fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
