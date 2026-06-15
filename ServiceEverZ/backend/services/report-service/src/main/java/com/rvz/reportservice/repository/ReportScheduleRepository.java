package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.ReportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportScheduleRepository extends JpaRepository<ReportSchedule, Long> {

    List<ReportSchedule> findAllByActiveTrue();

    List<ReportSchedule> findAllByReportTypeAndActiveTrue(String reportType);
}
