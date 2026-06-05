package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import com.rvz.masterdataservice.dto.response.ServiceItemResponse;
import com.rvz.masterdataservice.service.MasterDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/master/items")
@CrossOrigin(origins = "http://localhost:5173/")
public class ServiceItemController {

    private static final Logger log = LoggerFactory.getLogger(ServiceItemController.class);

    private final MasterDataService masterDataService;

    public ServiceItemController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    /**
     * GET /api/master/items?subcategoryId=1
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     * When subcategoryId is supplied, returns items for that subcategory (original behaviour).
     *
     * GET /api/master/items   (no param)
     * ── NEW BEHAVIOUR – Added for email-ticket-service (Story 22) ──
     * When subcategoryId is absent, returns ALL items so the email service
     * can search by serviceName without knowing the subcategoryId in advance.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceItemResponse>>> getItems(
            @RequestParam(required = false) Integer subcategoryId) {
        List<ServiceItemResponse> data;
        if (subcategoryId != null) {
            log.info("GET /api/master/items?subcategoryId={}", subcategoryId);
            data = masterDataService.getItemsBySubcategoryId(subcategoryId);
        } else {
            log.info("GET /api/master/items (all)");
            data = masterDataService.getAllItems();
        }
        ApiResponse<List<ServiceItemResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Items fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/master/items/{serviceId}
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     */
    @GetMapping("/{serviceId}")
    public ResponseEntity<ApiResponse<ServiceItemResponse>> getItemById(
            @PathVariable Integer serviceId) {
        log.info("GET /api/master/items/{}", serviceId);
        ServiceItemResponse data = masterDataService.getItemById(serviceId);
        ApiResponse<ServiceItemResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Item fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/master/items/active
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ServiceItemResponse>>> getAllActiveItems() {
        log.info("GET /api/master/items/active");
        List<ServiceItemResponse> data = masterDataService.getAllActiveItems();
        ApiResponse<List<ServiceItemResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Active items fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
