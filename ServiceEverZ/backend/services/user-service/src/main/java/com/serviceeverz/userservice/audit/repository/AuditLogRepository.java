package com.serviceeverz.userservice.audit.repository;

import com.serviceeverz.userservice.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTargetUserIdOrderByCreatedAtDesc(Long userId);
    List<AuditLog> findByPerformedByOrderByCreatedAtDesc(String email);
}
