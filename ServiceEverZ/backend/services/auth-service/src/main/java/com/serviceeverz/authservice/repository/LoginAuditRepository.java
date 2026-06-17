package com.serviceeverz.authservice.repository;

import com.serviceeverz.authservice.entity.LoginAudit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginAuditRepository extends JpaRepository<LoginAudit, Long> {
}