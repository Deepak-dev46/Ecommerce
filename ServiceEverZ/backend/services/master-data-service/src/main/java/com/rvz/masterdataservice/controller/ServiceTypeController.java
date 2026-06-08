package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import com.rvz.masterdataservice.dto.response.ServiceTypeResponse;
import com.rvz.masterdataservice.service.MasterDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/master/types")
@CrossOrigin(origins="http://localhost:5173/")
public class ServiceTypeController {

    private static final Logger log = LoggerFactory.getLogger(ServiceTypeController.class);

    private final MasterDataService masterDataService;

    public ServiceTypeController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceTypeResponse>>> getAllTypes() {
        log.info("GET /api/master/types");
        List<ServiceTypeResponse> data = masterDataService.getAllServiceTypes();
        ApiResponse<List<ServiceTypeResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Service types fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
