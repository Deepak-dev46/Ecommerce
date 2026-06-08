package com.serviceeverz.roleservice.mapping.service;

import com.serviceeverz.roleservice.dto.MapRoleRequest;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import com.serviceeverz.roleservice.entity.UserRole; // adjust package as needed
 

public interface IUserRoleMappingService {
    void assignRole(MapRoleRequest req, Long assignedById);
    void revokeRole(Long userId, Long roleId);
    List<String> getRolesForUser(Long userId);
	void assignSingleRole(@Valid MapRoleRequest req, long l);
    List<Map<String, Object>> getRoleDistributionReport();
 
}
