package com.serviceeverz.rmoservice.project.dto;

import jakarta.validation.constraints.NotNull;

public class MapRoleRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
    @NotNull(message = "Role ID is required")
    private Long roleId;
    public Long getUserId() { return userId; }
    public void setUserId(Long v) { this.userId = v; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long v) { this.roleId = v; }
}