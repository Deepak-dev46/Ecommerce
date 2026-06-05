package com.serviceeverz.userservice.audit.service;

import com.serviceeverz.userservice.audit.entity.AuditLog;
import com.serviceeverz.userservice.audit.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository repo;

    @Autowired
    public AuditLogService(AuditLogRepository repo) { this.repo = repo; }

    public void log(String action, String performedBy, Long targetUserId, String details) {
        repo.save(new AuditLog(action, performedBy, targetUserId, details));
    }
}
