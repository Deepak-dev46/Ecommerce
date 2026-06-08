package com.serviceeverz.roleservice.permission.dto;
 
import com.serviceeverz.roleservice.shared.enums.PermissionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
 
public class RolePermissionRequest {
 
    @NotNull(message = "Role ID is required")
    private Long roleId;
 
    @NotBlank(message = "Module is required")
    private String module;
 
    @NotBlank(message = "Feature is required")
    private String feature;
 
    @NotNull(message = "Permission type is required")
    private PermissionType permissionType;
 
    private boolean granted = true;
 
    // Getters
    public Long getRoleId()                  { return roleId; }
    public String getModule()                { return module; }
    public String getFeature()               { return feature; }
    public PermissionType getPermissionType(){ return permissionType; }
    public boolean isGranted()               { return granted; }
 
    // Setters
    public void setRoleId(Long v)              { this.roleId = v; }
    public void setModule(String v)            { this.module = v; }
    public void setFeature(String v)           { this.feature = v; }
    public void setPermissionType(PermissionType v){ this.permissionType = v; }
    public void setGranted(boolean v)          { this.granted = v; }
}
 