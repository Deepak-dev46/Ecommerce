package com.rvz.emailticketservice.repository;

import com.rvz.emailticketservice.entity.InboundEmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InboundEmailLogRepository extends JpaRepository<InboundEmailLog, Long> {
    boolean existsByMessageId(String messageId);
}