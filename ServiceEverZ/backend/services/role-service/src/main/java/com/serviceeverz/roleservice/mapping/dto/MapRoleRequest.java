package com.serviceeverz.roleservice.mapping.dto;
 
import jakarta.validation.constraints.NotNull;
 
public class MapRoleRequest {
 
    @NotNull(message = "User ID is required")
    private Long userId;
 
    @NotNull(message = "Role ID is required")
    private Long roleId;
 
    public MapRoleRequest() {
    }
 
    public Long getUserId() {
        return userId;
    }
 
    public void setUserId(Long userId) {
        this.userId = userId;
    }
 
    public Long getRoleId() {
        return roleId;
    }
 
    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
}