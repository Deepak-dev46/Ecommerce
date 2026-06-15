package com.serviceeverz.roleservice.mapping.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.serviceeverz.roleservice.entity.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "user_role_mappings")
public class UserRoleMapping {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    @Column(nullable = false)
    private Long assignedBy;
    @CreationTimestamp
    private LocalDateTime assignedAt;
    private LocalDateTime revokedAt;
    @Column(nullable = false)
    private boolean active = true;
    public UserRoleMapping() {}
    public UserRoleMapping(Long userId, Role role, Long assignedBy) { this.userId = userId; this.role = role; this.assignedBy = assignedBy; }
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long v) { this.userId = v; }
    public Role getRole() { return role; }
    public void setRole(Role v) { this.role = v; }
    public Long getAssignedBy() { return assignedBy; }
    public void setAssignedBy(Long v) { this.assignedBy = v; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public LocalDateTime getRevokedAt() { return revokedAt; }
    public void setRevokedAt(LocalDateTime v) { this.revokedAt = v; }
    public boolean isActive() { return active; }
    public void setActive(boolean v) { this.active = v; }
}
