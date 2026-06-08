package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import com.rvz.masterdataservice.dto.response.ServiceSubcategoryResponse;
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
@RequestMapping("/api/master/subcategories")
@CrossOrigin(origins = "http://localhost:5173/")
public class ServiceSubcategoryController {

    private static final Logger log = LoggerFactory.getLogger(ServiceSubcategoryController.class);

    private final MasterDataService masterDataService;

    public ServiceSubcategoryController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    /**
     * GET /api/master/subcategories?categoryId=1
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     * When categoryId is supplied, returns subcategories for that category (original behaviour).
     *
     * GET /api/master/subcategories   (no param)
     * ── NEW BEHAVIOUR – Added for email-ticket-service (Story 22) ──
     * When categoryId is absent, returns ALL subcategories so the email service
     * can search by name without knowing the categoryId in advance.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceSubcategoryResponse>>> getSubcategories(
            @RequestParam(required = false) Integer categoryId) {
        List<ServiceSubcategoryResponse> data;
        if (categoryId != null) {
            log.info("GET /api/master/subcategories?categoryId={}", categoryId);
            data = masterDataService.getSubcategoriesByCategoryId(categoryId);
        } else {
            log.info("GET /api/master/subcategories (all)");
            data = masterDataService.getAllSubcategories();
        }
        ApiResponse<List<ServiceSubcategoryResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Subcategories fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/master/subcategories/{id}
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceSubcategoryResponse>> getSubcategoryById(
            @PathVariable Integer id) {
        log.info("GET /api/master/subcategories/{}", id);
        ServiceSubcategoryResponse data = masterDataService.getSubcategoryById(id);
        ApiResponse<ServiceSubcategoryResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Subcategory fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
