package com.serviceeverz.roleservice.mapping.dto;
 
import jakarta.validation.constraints.NotNull;
import java.util.List;
 
public class BulkMapRoleRequest {
 
    @NotNull(message = "User IDs are required")
    private List<Long> userIds;
 
    @NotNull(message = "Role ID is required")
    private Long roleId;
 
    public List<Long> getUserIds() { return userIds; }
    public void setUserIds(List<Long> userIds) { this.userIds = userIds; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
}
 
 