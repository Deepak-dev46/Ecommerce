// package com.serviceeverz.roleservice.mapping.service;

// import java.util.List;
// import java.util.stream.Collectors;

// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.serviceeverz.roleservice.client.UserClient;
// import com.serviceeverz.roleservice.dto.MapRoleRequest;
// import com.serviceeverz.roleservice.entity.Role;
// import com.serviceeverz.roleservice.mapping.entity.UserRoleMapping;
// import com.serviceeverz.roleservice.mapping.repository.UserRoleMappingRepository;
// import com.serviceeverz.roleservice.role.repository.RoleRepository;
// import com.serviceeverz.roleservice.shared.exception.BusinessRuleException;
// import com.serviceeverz.roleservice.shared.exception.DuplicateResourceException;
// import com.serviceeverz.roleservice.shared.exception.ResourceNotFoundException;

// import jakarta.validation.Valid;

// import java.util.Map;
// import java.util.HashMap;
// import java.util.ArrayList;

 

// @Service
// @Transactional
// public class UserRoleMappingServiceImpl implements IUserRoleMappingService {
// 	private final UserRoleMappingRepository mappingRepository;
// 	private final RoleRepository roleRepository;
// 	private final UserClient userClient;

// 	public UserRoleMappingServiceImpl(UserRoleMappingRepository mappingRepository, RoleRepository roleRepository,
// 			UserClient userClient) {
// 		this.mappingRepository = mappingRepository;
// 		this.roleRepository = roleRepository;
// 		this.userClient = userClient;
// 	}

// 	public void assignRole(MapRoleRequest req, Long assignedById) {
// 		boolean active;
// 		try {
// 			active = userClient.isUserActive(req.getUserId());
// 		} catch (Exception e) {
// 			throw new BusinessRuleException("Could not verify user status for userId: " + req.getUserId());
// 		}
// 		if (!active)
// 			throw new BusinessRuleException("User not found or inactive: " + req.getUserId());
// 		Role role = roleRepository.findById(req.getRoleId())
// 				.orElseThrow(() -> new ResourceNotFoundException("Role not found: " + req.getRoleId()));
// 		if (mappingRepository.existsByUserIdAndRoleIdAndActiveTrue(req.getUserId(), role.getId()))
// 			throw new DuplicateResourceException("Role already assigned to this user");
// 		mappingRepository.save(new UserRoleMapping(req.getUserId(), role, assignedById));
// 	}

// 	public void revokeRole(Long userId, Long roleId) {
// 		UserRoleMapping mapping = mappingRepository.findByUserIdAndRole_IdAndActiveTrue(userId, roleId)
// 				.orElseThrow(() -> new ResourceNotFoundException("Active role mapping not found"));
// 		mappingRepository.deleteByUserId(userId);
// 	}

// 	@Transactional(readOnly = true)
// 	public List<String> getRolesForUser(Long userId) {
// 		return mappingRepository.findByUserIdAndActiveTrue(userId).stream().map(m -> m.getRole().getName())
// 				.collect(Collectors.toList());
// 	}
	
// 	@Override
// 	public void assignSingleRole(@Valid MapRoleRequest req, long adminId) {

// 	    Long userId = req.getUserId();
// 	    Long roleId = req.getRoleId();

// 	    // ✅ Remove all existing roles first
// 	    roleRepository.deleteByUserId(userId, roleId);
// 	    mappingRepository.deleteByUserId(userId);

// 	    // ✅ Assign new role
// 	    assignRole(req, adminId);
// 	}


// // 	@Override
// // public List<Map<String, Object>> getRoleDistributionReport() {
// //     List<UserRoleMapping> mappings = mappingRepository.findByActiveTrue(); // ✅ already have this
// //     List<Map<String, Object>> result = new ArrayList<>();
 
// //     for (UserRoleMapping mapping : mappings) {
// //         Map<String, Object> row = new HashMap<>();
// //         row.put("userId", mapping.getUserId());
// //         row.put("roleId", mapping.getRole().getId());
// //         row.put("roleName", mapping.getRole().getName());
// //         row.put("roleActive", mapping.getRole().isActive());
// //         result.add(row);
// //     }
// //     return result;


// // }
 
 
// @Override
// @Transactional(readOnly = true) // ✅ transaction open வச்சிருக்கும்
// public List<Map<String, Object>> getRoleDistributionReport() {
//     List<UserRoleMapping> mappings = mappingRepository.findAllActiveWithRole(); // ✅ JOIN FETCH
//     List<Map<String, Object>> result = new ArrayList<>();
 
//     for (UserRoleMapping mapping : mappings) {
//         Map<String, Object> row = new HashMap<>();
//         row.put("userId", mapping.getUserId());
//         row.put("roleId", mapping.getRole().getId());
//         row.put("roleName", mapping.getRole().getName());
//         row.put("roleActive", mapping.getRole().isActive());
//         result.add(row);
//     }
//     return result;
// }
 
 

// }


package com.serviceeverz.roleservice.mapping.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.serviceeverz.roleservice.client.AssignmentServiceClient;
import com.serviceeverz.roleservice.client.UserClient;
import com.serviceeverz.roleservice.dto.MapRoleRequest;
import com.serviceeverz.roleservice.entity.Role;
import com.serviceeverz.roleservice.mapping.dto.BulkMapRoleRequest;
import com.serviceeverz.roleservice.mapping.entity.UserRoleMapping;
import com.serviceeverz.roleservice.mapping.repository.UserRoleMappingRepository;
import com.serviceeverz.roleservice.role.repository.RoleRepository;
import com.serviceeverz.roleservice.shared.exception.BusinessRuleException;
import com.serviceeverz.roleservice.shared.exception.DuplicateResourceException;
import com.serviceeverz.roleservice.shared.exception.ResourceNotFoundException;

import jakarta.validation.Valid;

import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class UserRoleMappingServiceImpl implements IUserRoleMappingService {

    private static final Logger log = LoggerFactory.getLogger(UserRoleMappingServiceImpl.class);

    // Role name that triggers capacity creation in assignment-service
    private static final String SUPPORT_PERSONNEL_ROLE = "SUPPORT_PERSONNEL";

    private final UserRoleMappingRepository mappingRepository;
    private final RoleRepository            roleRepository;
    private final UserClient                userClient;
    private final AssignmentServiceClient   assignmentServiceClient;

    public UserRoleMappingServiceImpl(UserRoleMappingRepository mappingRepository,
                                      RoleRepository roleRepository,
                                      UserClient userClient,
                                      AssignmentServiceClient assignmentServiceClient) {
        this.mappingRepository        = mappingRepository;
        this.roleRepository           = roleRepository;
        this.userClient               = userClient;
        this.assignmentServiceClient  = assignmentServiceClient;
    }

    @Override
    public void assignRole(MapRoleRequest req, Long assignedById) {
        boolean active;
        try {
            active = userClient.isUserActive(req.getUserId());
        } catch (Exception e) {
            throw new BusinessRuleException("Could not verify user status for userId: " + req.getUserId());
        }
        if (!active)
            throw new BusinessRuleException("User not found or inactive: " + req.getUserId());

        Role role = roleRepository.findById(req.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + req.getRoleId()));

        if (mappingRepository.existsByUserIdAndRoleIdAndActiveTrue(req.getUserId(), role.getId()))
            throw new DuplicateResourceException("Role already assigned to this user");

        mappingRepository.save(new UserRoleMapping(req.getUserId(), role, assignedById));

        // ── NEW: if SUPPORT_PERSONNEL role assigned, auto-create capacity entry ──
        notifyAssignmentServiceIfSupportPersonnel(req.getUserId(), role.getName());
    }

    @Override
    public void revokeRole(Long userId, Long roleId) {
        UserRoleMapping mapping = mappingRepository.findByUserIdAndRole_IdAndActiveTrue(userId, roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Active role mapping not found"));
        mappingRepository.deleteByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getRolesForUser(Long userId) {
        return mappingRepository.findByUserIdAndActiveTrue(userId).stream()
                .map(m -> m.getRole().getName())
                .collect(Collectors.toList());
    }

    @Override
    public void assignSingleRole(@Valid MapRoleRequest req, long adminId) {
        Long userId = req.getUserId();
        Long roleId = req.getRoleId();

        // Remove all existing roles first
        roleRepository.deleteByUserId(userId, roleId);
        mappingRepository.deleteByUserId(userId);

        // Assign new role
        assignRole(req, adminId);
        // NOTE: notifyAssignmentServiceIfSupportPersonnel is already called inside assignRole above
    }

    @Override
    public List<Map<String, Object>> getRoleDistributionReport() {
        List<UserRoleMapping> mappings = mappingRepository.findByActiveTrue();
        List<Map<String, Object>> result = new ArrayList<>();
        for (UserRoleMapping mapping : mappings) {
            Map<String, Object> row = new HashMap<>();
            row.put("userId",     mapping.getUserId());
            row.put("roleId",     mapping.getRole().getId());
            row.put("roleName",   mapping.getRole().getName());
            row.put("roleActive", mapping.getRole().isActive());
            result.add(row);
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // If the role being assigned is SUPPORT_PERSONNEL, call assignment-service
    // to create the capacity row so auto-assignment can pick this person up.
    // Failure is non-fatal — we log a warning but don't block role assignment.
    // ─────────────────────────────────────────────────────────────────────────
    // private void notifyAssignmentServiceIfSupportPersonnel(Long userId, String roleName) {
    //     if (!SUPPORT_PERSONNEL_ROLE.equalsIgnoreCase(roleName)) return;
    //     try {
    //         Map<String, Object> body = new HashMap<>();
    //         body.put("supportPersonId",   userId);
    //         body.put("supportPersonName", "Support Personnel"); // name resolved by assignment-service if needed
    //         assignmentServiceClient.addSupportPersonnelCapacity(body);
    //         log.info("Notified assignment-service: capacity entry created for userId={}", userId);
    //     } catch (Exception ex) {
    //         log.warn("Could not notify assignment-service for userId={}: {}", userId, ex.getMessage());
    //     }
    // }

	private void notifyAssignmentServiceIfSupportPersonnel(Long userId, String roleName) {
    if (!SUPPORT_PERSONNEL_ROLE.equalsIgnoreCase(roleName)) return;
    try {
        // Fetch real name from user-service
        String fullName = "Support Personnel"; // safe fallback
        try {
            java.util.Map<String, Object> userData = userClient.getUserById(userId);
            String fn = String.valueOf(userData.getOrDefault("firstName", ""));
            String ln = String.valueOf(userData.getOrDefault("lastName", ""));
            String computed = (fn + " " + ln).trim();
            if (!computed.isBlank()) fullName = computed;
        } catch (Exception nameEx) {
            log.warn("Could not fetch name for userId={}, using fallback: {}", userId, nameEx.getMessage());
        }
 
        Map<String, Object> body = new HashMap<>();
        body.put("supportPersonId",   userId);
        body.put("supportPersonName", fullName);
        assignmentServiceClient.addSupportPersonnelCapacity(body);
        log.info("Notified assignment-service: capacity entry created for userId={}, name={}", userId, fullName);
    } catch (Exception ex) {
        log.warn("Could not notify assignment-service for userId={}: {}", userId, ex.getMessage());
    }
	}
}
