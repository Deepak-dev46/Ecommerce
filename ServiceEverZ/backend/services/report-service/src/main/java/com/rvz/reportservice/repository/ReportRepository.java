package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.ReportRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<ReportRecord, Long>,
        JpaSpecificationExecutor<ReportRecord> {

    Page<ReportRecord> findByReportType(String reportType, Pageable pageable);

    Page<ReportRecord> findByGeneratedBy(String generatedBy, Pageable pageable);

    List<ReportRecord> findByGeneratedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT r FROM ReportRecord r " +
           "WHERE r.reportType = :reportType " +
           "AND r.generatedAt BETWEEN :from AND :to " +
           "ORDER BY r.generatedAt DESC")
    List<ReportRecord> findByTypeAndDateRange(
            @Param("reportType") String reportType,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
