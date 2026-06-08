package com.serviceeverz.roleservice.role.service;
 
import com.serviceeverz.roleservice.role.dto.CreateRoleRequest;
import com.serviceeverz.roleservice.role.dto.RoleResponse;
import java.util.List;
 
public interface IRoleService {
    RoleResponse createRole(CreateRoleRequest req);
    List<RoleResponse> getAllRoles();
    RoleResponse getRoleById(Long id);
    RoleResponse updateRole(Long id, CreateRoleRequest req);
    // void deactivateRole(Long id);
    void deleteRole(Long id);
}
 