package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long>,
        JpaSpecificationExecutor<Incident> {

    List<Incident> findByStatus(String status);

    long countByStatus(String status);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT i.status AS status, COUNT(i) AS count " +
           "FROM Incident i " +
           "GROUP BY i.status")
    List<Map<String, Object>> countGroupByStatus();

    @Query("SELECT i.priority AS priority, COUNT(i) AS count " +
           "FROM Incident i " +
           "GROUP BY i.priority " +
           "ORDER BY COUNT(i) DESC")
    List<Map<String, Object>> countGroupByPriority();

    @Query("SELECT i.categoryName AS category, COUNT(i) AS count " +
           "FROM Incident i " +
           "GROUP BY i.categoryName " +
           "ORDER BY COUNT(i) DESC")
    List<Map<String, Object>> countGroupByCategory();

    @Query("SELECT i.assignedToName AS assignee, COUNT(i) AS count " +
           "FROM Incident i " +
           "WHERE i.assignedToName IS NOT NULL " +
           "GROUP BY i.assignedToName " +
           "ORDER BY COUNT(i) DESC")
    List<Map<String, Object>> countGroupByAssignee();

    @Query("SELECT i.source AS source, COUNT(i) AS count " +
           "FROM Incident i " +
           "GROUP BY i.source")
    List<Map<String, Object>> countGroupBySource();

    @Query(value = "SELECT DATE(created_at) AS date, COUNT(*) AS count " +
                   "FROM incident " +
                   "WHERE created_at BETWEEN :from AND :to " +
                   "GROUP BY DATE(created_at) " +
                   "ORDER BY DATE(created_at)",
           nativeQuery = true)
    List<Map<String, Object>> dailyIncidentVolume(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
