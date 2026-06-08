package com.rvz.serviceeverz.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.AssetMapping;
import com.rvz.serviceeverz.enums.MappingStatus;
 
@Repository
public interface AssetMappingRepository extends JpaRepository<AssetMapping, Long> {
    Optional<AssetMapping> findByMappingNumber(String mappingNumber);
    List<AssetMapping> findAllByOrderByCreatedAtDesc();
    List<AssetMapping> findAllByStatus(MappingStatus status);
    List<AssetMapping> findAllByRequestedByUserId(Long userId);
    List<AssetMapping> findAllByAssignedBySpId(Long spId);
    List<AssetMapping> findAllByAsset_IdOrderByCreatedAtDesc(Long assetId);
    List<AssetMapping> findAllByStatusIn(List<MappingStatus> statuses);
    boolean existsByAsset_IdAndStatusIn(Long assetId, List<MappingStatus> statuses);
}
 