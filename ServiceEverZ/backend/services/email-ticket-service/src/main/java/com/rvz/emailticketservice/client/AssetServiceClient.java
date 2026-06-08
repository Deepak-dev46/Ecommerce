package com.rvz.emailticketservice.client;
 
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;
 
/**
 * Calls asset-service (port 8085).
 * GET /api/asset-mappings/user/{userId}
 * Returns ApiResponse<List<AssetMappingResponse>>
 * Fields used: assetId, assetName, assetTag, status
 */
@FeignClient(name = "email-asset-service", url = "${asset.service.url}")
public interface AssetServiceClient {
 
    @GetMapping("/api/asset-mappings/user/{userId}")
    Map<String, Object> getAssetMappingsByUser(@PathVariable("userId") Long userId);
}
 