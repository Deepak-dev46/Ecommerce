package com.serviceeverz.rmoservice.assignment.dto;

import com.serviceeverz.rmoservice.assignment.entity.ProjectMember;
import com.serviceeverz.rmoservice.shared.enums.MembershipType;

import java.time.LocalDateTime;

public class ProjectMemberResponse {

    private Long id;
    private Long projectId;
    private Long userId;
    private MembershipType membershipType;
    private Long assignedBy;
    private LocalDateTime assignedAt;
    private boolean active;

    public static ProjectMemberResponse from(ProjectMember m) {
        ProjectMemberResponse r = new ProjectMemberResponse();
        r.id = m.getId();
        r.projectId = m.getProjectId();
        r.userId = m.getUserId();
        r.membershipType = m.getMembershipType();
        r.assignedBy = m.getAssignedBy();
        r.assignedAt = m.getAssignedAt();
        r.active = m.isActive();
        return r;
    }

    public Long getId() { return id; }
    public Long getProjectId() { return projectId; }
    public Long getUserId() { return userId; }
    public MembershipType getMembershipType() { return membershipType; }
    public Long getAssignedBy() { return assignedBy; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public boolean isActive() { return active; }
}