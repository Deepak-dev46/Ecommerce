package com.rvz.masterdataservice.repository;

import com.rvz.masterdataservice.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    /** All ACTIVE assets owned by a specific user */
    List<Asset> findByUserIdAndStatus(Long userId, String status);

    /** All ACTIVE assets (admin view) */
    List<Asset> findByStatus(String status);
}
