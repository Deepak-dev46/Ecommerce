// FILE: rmo-service/src/main/java/com/serviceeverz/rmoservice/userview/controller/InternalUserRoleController.java
package com.serviceeverz.rmoservice.userview.controller;
 
import com.serviceeverz.rmoservice.project.repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.ArrayList;
import java.util.List;
 
/**
 * Internal endpoint called by auth-service at login time.
 * Determines which project-level roles a user has based on their
 * assignments as l1_manager_id, l2_manager_id, resource_owner_id
 * across all active projects.
 *
 * No security filter — called service-to-service via Eureka.
 */
@RestController
@RequestMapping("/api/v1/rmo/users")
public class InternalUserRoleController {
 
    private final ProjectRepository projectRepository;
 
    public InternalUserRoleController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }
 
    /**
     * Returns effective project-level roles for a user.
     * Example: ["END_USER", "APPROVAL_MANAGER_L1", "RESOURCE_OWNER"]
     * These are ADDITIVE to the user's assigned roles from role-service.
     */
    @GetMapping("/{userId}/effective-roles")
    public ResponseEntity<List<String>> getEffectiveRoles(@PathVariable Long userId) {
        List<String> effectiveRoles = new ArrayList<>();
 
        // Check if user is L1 manager on any active project
        boolean isL1 = projectRepository.existsByL1ManagerIdAndStatusNot(
                userId, com.serviceeverz.rmoservice.shared.enums.ProjectStatus.INACTIVE);
        if (isL1) effectiveRoles.add("APPROVAL_MANAGER_L1");
 
        // Check if user is L2 manager on any active project
        boolean isL2 = projectRepository.existsByL2ManagerIdAndStatusNot(
                userId, com.serviceeverz.rmoservice.shared.enums.ProjectStatus.INACTIVE);
        if (isL2) effectiveRoles.add("APPROVAL_MANAGER_L2");
 
        // Check if user is resource owner on any active project
        boolean isRO = projectRepository.existsByResourceOwnerIdAndStatusNot(
                userId, com.serviceeverz.rmoservice.shared.enums.ProjectStatus.INACTIVE);
        if (isRO) effectiveRoles.add("RESOURCE_OWNER");
 
        return ResponseEntity.ok(effectiveRoles);
    }
}
 