package com.serviceeverz.roleservice.config;
 
import com.serviceeverz.roleservice.entity.Role;
import com.serviceeverz.roleservice.mapping.entity.UserRoleMapping;
import com.serviceeverz.roleservice.mapping.repository.UserRoleMappingRepository;
import com.serviceeverz.roleservice.role.repository.RoleRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
 
@Component
public class DataSeeder implements ApplicationRunner {
 
    private final RoleRepository repo;
    private final UserRoleMappingRepository mappingRepository;
 
    public DataSeeder(RoleRepository repo, UserRoleMappingRepository mappingRepository) {
        this.repo = repo;
        this.mappingRepository = mappingRepository;
    }
 
    @Override
    public void run(ApplicationArguments args) {
        seed("ADMIN",                "Administrator");
        seed("RMO",                  "Resource management owner");
        seed("ITSM_MANAGER",         "ITSM manager full ticket management");
        seed("END_USER",             "End user");
        seed("SUPPORT_PERSONNEL",    "Support personnel");
        seed("APPROVAL_MANAGER_L1",  "Approval manager level 1");
        seed("APPROVAL_MANAGER_L2",  "Approval manager level 2");
        seed("RESOURCE_OWNER",       "Resource owner");
 
        assignAdminRole();
    }
 
    private void seed(String name, String description) {
        if (!repo.existsByNameIgnoreCase(name)) {
            repo.save(new Role(name, description));
        }
    }
 
    private void assignAdminRole() {
        Long adminUserId = 1L;
 
        Role adminRole = repo.findByNameIgnoreCase("ADMIN").orElse(null);
        if (adminRole == null) return;
 
        boolean alreadyAssigned = mappingRepository
                .existsByUserIdAndRoleIdAndActiveTrue(adminUserId, adminRole.getId());
 
        if (!alreadyAssigned) {
            mappingRepository.save(new UserRoleMapping(adminUserId, adminRole, 0L));
        }
    }
}
 