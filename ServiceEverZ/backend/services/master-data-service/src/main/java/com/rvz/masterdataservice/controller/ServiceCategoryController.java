package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import com.rvz.masterdataservice.dto.response.ServiceCategoryResponse;
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
@RequestMapping("/api/master/categories")
@CrossOrigin(origins = "http://localhost:5173/")
public class ServiceCategoryController {

    private static final Logger log = LoggerFactory.getLogger(ServiceCategoryController.class);

    private final MasterDataService masterDataService;

    public ServiceCategoryController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    /**
     * GET /api/master/categories?typeId=1
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     * When typeId is supplied, returns only categories for that type (original behaviour).
     *
     * GET /api/master/categories   (no param)
     * ── NEW BEHAVIOUR – Added for email-ticket-service (Story 22) ──
     * When typeId is absent, returns ALL categories so the email service can
     * search by name without knowing the typeId in advance.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceCategoryResponse>>> getCategories(
            @RequestParam(required = false) Integer typeId) {
        List<ServiceCategoryResponse> data;
        if (typeId != null) {
            log.info("GET /api/master/categories?typeId={}", typeId);
            data = masterDataService.getCategoriesByTypeId(typeId);
        } else {
            log.info("GET /api/master/categories (all)");
            data = masterDataService.getAllCategories();
        }
        ApiResponse<List<ServiceCategoryResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Categories fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/master/categories/{id}
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceCategoryResponse>> getCategoryById(
            @PathVariable Integer id) {
        log.info("GET /api/master/categories/{}", id);
        ServiceCategoryResponse data = masterDataService.getCategoryById(id);
        ApiResponse<ServiceCategoryResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Category fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
