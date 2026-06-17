package com.serviceeverz.rmoservice.assignment.entity;

import com.serviceeverz.rmoservice.shared.enums.MembershipType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "user_id"})
})
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_type", nullable = false)
    private MembershipType membershipType;

    @Column(name = "assigned_by")
    private Long assignedBy;

    @CreationTimestamp
    private LocalDateTime assignedAt;

    @Column(nullable = false)
    private boolean active = true;

    public ProjectMember() {}

    public ProjectMember(Long projectId, Long userId, MembershipType membershipType, Long assignedBy) {
        this.projectId = projectId;
        this.userId = userId;
        this.membershipType = membershipType;
        this.assignedBy = assignedBy;
    }

    public Long getId() { return id; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long v) { this.projectId = v; }
    public Long getUserId() { return userId; }
    public void setUserId(Long v) { this.userId = v; }
    public MembershipType getMembershipType() { return membershipType; }
    public void setMembershipType(MembershipType v) { this.membershipType = v; }
    public Long getAssignedBy() { return assignedBy; }
    public void setAssignedBy(Long v) { this.assignedBy = v; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean v) { this.active = v; }
}