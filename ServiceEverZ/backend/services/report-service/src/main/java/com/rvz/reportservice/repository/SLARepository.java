package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.SLA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface SLARepository extends JpaRepository<SLA, Long>,
        JpaSpecificationExecutor<SLA> {

    Optional<SLA> findByTicketId(Long ticketId);

    List<SLA> findByBreached(Boolean breached);

    long countByBreached(Boolean breached);

    @Query("SELECT s FROM SLA s WHERE s.startedAt BETWEEN :from AND :to")
    List<SLA> findByStartedAtBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(s) FROM SLA s WHERE s.breached = true " +
           "AND s.startedAt BETWEEN :from AND :to")
    long countBreachedBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(s) FROM SLA s WHERE s.startedAt BETWEEN :from AND :to")
    long countTotalBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT s.categoryName AS category, " +
           "COUNT(s) AS total, " +
           "SUM(CASE WHEN s.breached = true THEN 1 ELSE 0 END) AS breached " +
           "FROM SLA s " +
           "GROUP BY s.categoryName " +
           "ORDER BY COUNT(s) DESC")
    List<Map<String, Object>> slaComplianceByCategoryNative();

    @Query("SELECT s.assigneeName AS assignee, " +
           "COUNT(s) AS total, " +
           "SUM(CASE WHEN s.breached = true THEN 1 ELSE 0 END) AS breached " +
           "FROM SLA s " +
           "WHERE s.assigneeName IS NOT NULL " +
           "GROUP BY s.assigneeName " +
           "ORDER BY COUNT(s) DESC")
    List<Map<String, Object>> slaComplianceByAssignee();

    @Query("SELECT AVG(s.resolutionTimeMinutes) FROM SLA s WHERE s.resolutionTimeMinutes IS NOT NULL")
    Double avgResolutionTimeMinutes();

    @Query("SELECT AVG(s.responseTimeMinutes) FROM SLA s WHERE s.responseTimeMinutes IS NOT NULL")
    Double avgResponseTimeMinutes();
}
