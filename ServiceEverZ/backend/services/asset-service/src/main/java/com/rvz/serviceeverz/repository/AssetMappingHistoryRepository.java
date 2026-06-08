package com.rvz.serviceeverz.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.AssetMappingHistory;
 
@Repository
public interface AssetMappingHistoryRepository extends JpaRepository<AssetMappingHistory, Long> {
    List<AssetMappingHistory> findAllByAssetIdOrderByAssignedFromDesc(Long assetId);
    List<AssetMappingHistory> findAllByUserIdOrderByAssignedFromDesc(Long userId);
    List<AssetMappingHistory> findAllByMappingIdOrderByRecordedAtDesc(Long mappingId);
}
 