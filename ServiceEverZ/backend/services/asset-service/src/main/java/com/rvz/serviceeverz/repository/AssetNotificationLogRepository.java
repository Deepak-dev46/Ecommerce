package com.rvz.serviceeverz.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.AssetNotificationLog;
 
@Repository
public interface AssetNotificationLogRepository extends JpaRepository<AssetNotificationLog, Long> {
    List<AssetNotificationLog> findAllByMappingIdOrderBySentAtDesc(Long mappingId);
}
 