package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long>,
        JpaSpecificationExecutor<Approval> {

    Optional<Approval> findByTicketId(Long ticketId);

    List<Approval> findByOverallStatus(String overallStatus);

    long countByOverallStatus(String overallStatus);

    @Query("SELECT a.overallStatus AS status, COUNT(a) AS count " +
           "FROM Approval a " +
           "GROUP BY a.overallStatus")
    List<Map<String, Object>> countGroupByOverallStatus();

    @Query("SELECT a.l1ApproverName AS approver, COUNT(a) AS total, " +
           "SUM(CASE WHEN a.l1Status = 'APPROVED' THEN 1 ELSE 0 END) AS approved, " +
           "SUM(CASE WHEN a.l1Status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected " +
           "FROM Approval a WHERE a.l1ApproverName IS NOT NULL " +
           "GROUP BY a.l1ApproverName")
    List<Map<String, Object>> approvalStatsByL1Approver();
}
