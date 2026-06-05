package com.rvz.serviceeverz.service;

import java.util.List;

import com.rvz.serviceeverz.dto.request.AdditionalDetailsRequest;
import com.rvz.serviceeverz.dto.request.AssetMappingRequest;
import com.rvz.serviceeverz.dto.request.AssetReleaseRequest;
import com.rvz.serviceeverz.dto.request.ManagerDecisionRequest;
import com.rvz.serviceeverz.dto.request.SupportPersonnelDecisionRequest;
import com.rvz.serviceeverz.dto.response.AssetMappingResponse;
import com.rvz.serviceeverz.entity.AssetMappingHistory;

public interface AssetMappingService {
	AssetMappingResponse createMapping(AssetMappingRequest request);

	AssetMappingResponse spDecision(Long mappingId, SupportPersonnelDecisionRequest request);

	AssetMappingResponse managerDecision(Long mappingId, ManagerDecisionRequest request);

	AssetMappingResponse submitAdditionalDetails(Long mappingId, AdditionalDetailsRequest request);

	AssetMappingResponse releaseAsset(Long mappingId, AssetReleaseRequest request);

	AssetMappingResponse getMappingById(Long id);

	List<AssetMappingResponse> getAllMappings();

	List<AssetMappingResponse> getMappingsByUser(Long userId);

	List<AssetMappingResponse> getMappingsBySp(Long spId);

	List<AssetMappingResponse> getMappingsByAsset(Long assetId);

	List<AssetMappingResponse> getPendingSpApprovals();

	List<AssetMappingResponse> getPendingManagerApprovals();

	List<AssetMappingHistory> getHistoryByAsset(Long assetId);

	List<AssetMappingHistory> getHistoryByUser(Long userId);
}