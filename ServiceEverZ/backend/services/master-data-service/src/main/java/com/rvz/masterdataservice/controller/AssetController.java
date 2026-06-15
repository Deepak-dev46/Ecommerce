package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import com.rvz.masterdataservice.dto.response.AssetResponse;
import com.rvz.masterdataservice.entity.Asset;
import com.rvz.masterdataservice.repository.AssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * GET /api/master/assets?userId={id}   → returns ACTIVE assets for that user
 * GET /api/master/assets               → returns ALL ACTIVE assets (admin)
 */
@RestController
@RequestMapping("/api/master/assets")
@CrossOrigin(origins="http://localhost:5173/")
public class AssetController {

    private static final Logger log = LoggerFactory.getLogger(AssetController.class);

    private final AssetRepository assetRepository;

    public AssetController(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getAssets(
            @RequestParam(required = false) Long userId) {

        List<Asset> assets;
        if (userId != null) {
            log.info("GET /api/master/assets?userId={}", userId);
            assets = assetRepository.findByUserIdAndStatus(userId, "ACTIVE");
        } else {
            log.info("GET /api/master/assets (all active)");
            assets = assetRepository.findByStatus("ACTIVE");
        }

        List<AssetResponse> data = assets.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        ApiResponse<List<AssetResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Assets fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    private AssetResponse toResponse(Asset a) {
        AssetResponse dto = new AssetResponse();
        dto.setId(a.getId());
        dto.setAssetTag(a.getAssetTag());
        dto.setAssetName(a.getAssetName());
        dto.setAssetType(a.getAssetType());
        dto.setUserId(a.getUserId());
        dto.setStatus(a.getStatus());
        return dto;
    }
}
