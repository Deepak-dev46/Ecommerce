package com.serviceeverz.userservice.audit.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;        // e.g. CREATE_USER, DISABLE_USER, UPDATE_USER

    @Column(nullable = false)
    private String performedBy;   // admin email

    private Long   targetUserId;
    private String details;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public AuditLog() {}

    public AuditLog(String action, String performedBy, Long targetUserId, String details) {
        this.action        = action;
        this.performedBy   = performedBy;
        this.targetUserId  = targetUserId;
        this.details       = details;
    }

    public Long          getId()                  { return id; }
    public String        getAction()              { return action; }
    public void          setAction(String v)      { this.action = v; }
    public String        getPerformedBy()         { return performedBy; }
    public void          setPerformedBy(String v) { this.performedBy = v; }
    public Long          getTargetUserId()        { return targetUserId; }
    public void          setTargetUserId(Long v)  { this.targetUserId = v; }
    public String        getDetails()             { return details; }
    public void          setDetails(String v)     { this.details = v; }
    public LocalDateTime getCreatedAt()           { return createdAt; }
}
