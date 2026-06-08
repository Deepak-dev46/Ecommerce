package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.Audit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long>,
        JpaSpecificationExecutor<Audit> {

    List<Audit> findByEntityTypeAndEntityId(String entityType, Long entityId);

    List<Audit> findByPerformedBy(String performedBy);

    Page<Audit> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<Audit> findByEntityType(String entityType, Pageable pageable);

    @Query("SELECT a.action AS action, COUNT(a) AS count " +
           "FROM Audit a " +
           "GROUP BY a.action " +
           "ORDER BY COUNT(a) DESC")
    List<Map<String, Object>> countGroupByAction();

    @Query("SELECT a.module AS module, COUNT(a) AS count " +
           "FROM Audit a " +
           "GROUP BY a.module " +
           "ORDER BY COUNT(a) DESC")
    List<Map<String, Object>> countGroupByModule();

    @Query("SELECT a.performedBy AS user, COUNT(a) AS activityCount " +
           "FROM Audit a " +
           "WHERE a.createdAt BETWEEN :from AND :to " +
           "GROUP BY a.performedBy " +
           "ORDER BY COUNT(a) DESC")
    List<Map<String, Object>> activityByUser(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query(value = "SELECT DATE(created_at) AS date, COUNT(*) AS count " +
                   "FROM audit_logs " +
                   "WHERE created_at BETWEEN :from AND :to " +
                   "GROUP BY DATE(created_at) " +
                   "ORDER BY DATE(created_at)",
           nativeQuery = true)
    List<Map<String, Object>> dailyAuditVolume(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
