package com.rvz.serviceeverz.repository;

import com.rvz.serviceeverz.entity.AssetSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetSpecificationRepository extends JpaRepository<AssetSpecification, Long> {

    List<AssetSpecification> findByAssetId(Long assetId);

    void deleteByAssetId(Long assetId);

    /**
     * Search assets by specification filter.
     * Returns assetIds where the asset has ALL the requested key/value pairs.
     * Used by the spec-filter search endpoint.
     *
     * Example: specKey=RAM, specValue=16GB  → returns IDs of assets with 16GB RAM
     */
    @Query("""
        SELECT s.asset.id FROM AssetSpecification s
        WHERE LOWER(s.specKey)   = LOWER(:specKey)
          AND LOWER(s.specValue) LIKE LOWER(CONCAT('%', :specValue, '%'))
        """)
    List<Long> findAssetIdsBySpec(@Param("specKey") String specKey,
                                  @Param("specValue") String specValue);
}
