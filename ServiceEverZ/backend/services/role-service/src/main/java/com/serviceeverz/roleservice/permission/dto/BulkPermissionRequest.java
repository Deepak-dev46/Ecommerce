package com.serviceeverz.roleservice.permission.dto;
 
import com.serviceeverz.roleservice.shared.enums.PermissionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
 
public class BulkPermissionRequest {
 
    @NotNull(message = "Role ID is required")
    private Long roleId;
 
    @NotBlank(message = "Module is required")  // ← NotBlank is better than NotNull for String
    private String module;
 
    @NotEmpty(message = "At least one feature is required")  // ← NotEmpty for List
    private List<String> features;
 
    @NotNull(message = "Permission type is required")
    private PermissionType permissionType;
 
    private boolean granted = true;  // ← defaults to true always
 
    // Getters
    public Long getRoleId()                  { return roleId; }
    public String getModule()                { return module; }
    public List<String> getFeatures()        { return features; }
    public PermissionType getPermissionType(){ return permissionType; }
    public boolean isGranted()               { return granted; }
 
    // Setters
    public void setRoleId(Long roleId)                      { this.roleId = roleId; }
    public void setModule(String module)                    { this.module = module; }
    public void setFeatures(List<String> features)          { this.features = features; }
    public void setPermissionType(PermissionType type)      { this.permissionType = type; }
    public void setGranted(boolean granted)                 { this.granted = granted; }
}