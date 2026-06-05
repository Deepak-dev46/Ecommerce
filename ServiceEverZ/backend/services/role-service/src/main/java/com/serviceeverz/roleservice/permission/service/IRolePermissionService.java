package com.serviceeverz.roleservice.permission.service;

import com.serviceeverz.roleservice.permission.dto.BulkPermissionRequest;
import com.serviceeverz.roleservice.permission.dto.RolePermissionRequest;
import com.serviceeverz.roleservice.permission.dto.RolePermissionResponse;
import com.serviceeverz.roleservice.shared.enums.PermissionType;
import java.util.List;

public interface IRolePermissionService {
    RolePermissionResponse savePermission(RolePermissionRequest req);
    List<RolePermissionResponse> savePermissionsBulk(BulkPermissionRequest req);
    List<RolePermissionResponse> getPermissionsForRole(Long roleId);
    boolean hasPermission(Long roleId, String module, String feature, PermissionType type);
}
