package com.serviceeverz.roleservice.permission.dto;

import com.serviceeverz.roleservice.permission.entity.RolePermission;
import com.serviceeverz.roleservice.shared.enums.PermissionType;

public class RolePermissionResponse {
    private Long id;
    private Long roleId;
    private String roleName;
    private String module;
    private String feature;
    private PermissionType permissionType;
    private boolean granted;
    public static RolePermissionResponse from(RolePermission p) {
        RolePermissionResponse r = new RolePermissionResponse();
        r.id = p.getId(); r.roleId = p.getRole().getId(); r.roleName = p.getRole().getName(); r.module = p.getModule(); r.feature = p.getFeature(); r.permissionType = p.getPermissionType(); r.granted = p.isGranted(); return r;
    }
    public Long getId() { return id; } public Long getRoleId() { return roleId; } public String getRoleName() { return roleName; } public String getModule() { return module; } public String getFeature() { return feature; } public PermissionType getPermissionType() { return permissionType; } public boolean isGranted() { return granted; }
}
