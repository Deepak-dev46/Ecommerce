package com.rvz.serviceeverz.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rvz.serviceeverz.entity.ChangeAuditLog;

import java.util.List;

@Repository
public interface ChangeAuditLogRepository extends JpaRepository<ChangeAuditLog, Long> {
    List<ChangeAuditLog> findAllByChangePlanIdOrderByPerformedAtAsc(Long changePlanId);
}
