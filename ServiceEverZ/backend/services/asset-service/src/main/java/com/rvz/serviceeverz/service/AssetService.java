package com.rvz.serviceeverz.service;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.rvz.serviceeverz.dto.request.AssetRequest;
import com.rvz.serviceeverz.dto.request.AssetStatusUpdateRequest;
import com.rvz.serviceeverz.dto.request.RentalReturnRequest;
import com.rvz.serviceeverz.dto.response.AssetResponse;
import com.rvz.serviceeverz.dto.response.AssetStatsResponse;
import com.rvz.serviceeverz.dto.response.BulkImportResult;
import com.rvz.serviceeverz.enums.AssetCategory;
import com.rvz.serviceeverz.enums.AssetOwnershipType;
import com.rvz.serviceeverz.enums.AssetStatus;
 
public interface AssetService {
    AssetResponse       addAsset(AssetRequest request);
    AssetResponse       updateAsset(Long id, AssetRequest request);
    AssetResponse       updateAssetStatus(Long id, AssetStatusUpdateRequest request);
    void                deleteAsset(Long id);
    AssetResponse       getAssetById(Long id);
    List<AssetResponse> getAllAssets();
    List<AssetResponse> getAssetsByStatus(AssetStatus status);
    List<AssetResponse> getAssetsByCategory(AssetCategory category);
    List<AssetResponse> getAssetsByOwnershipType(AssetOwnershipType type);
    List<AssetResponse> getAssetsByUser(Long userId);
    List<AssetResponse> searchAssets(String keyword);
    List<AssetResponse> searchAvailableAssets(String keyword);
    List<AssetResponse> searchAvailableAssets(String keyword, AssetCategory category);
    List<AssetResponse> getRentalAssetsExpiringSoon(int days);
    AssetResponse       markRentalReturned(Long id, RentalReturnRequest request);
    AssetStatsResponse  getStats();
    BulkImportResult    bulkImport(MultipartFile file, Long spId);
}
 