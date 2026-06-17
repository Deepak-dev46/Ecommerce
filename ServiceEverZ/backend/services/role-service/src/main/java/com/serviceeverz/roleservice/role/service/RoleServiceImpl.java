package com.serviceeverz.roleservice.role.service;
 
import com.serviceeverz.roleservice.entity.Role;
import com.serviceeverz.roleservice.role.dto.CreateRoleRequest;
import com.serviceeverz.roleservice.role.dto.RoleResponse;
import com.serviceeverz.roleservice.role.repository.RoleRepository;
import com.serviceeverz.roleservice.shared.exception.DuplicateResourceException;
import com.serviceeverz.roleservice.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@Transactional
public class RoleServiceImpl implements IRoleService {
 
    private final RoleRepository roleRepository;
 
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
 
    @Override
    public RoleResponse createRole(CreateRoleRequest req) {
        String name = req.getName().trim().toUpperCase();
        if (roleRepository.existsByNameIgnoreCase(name))
            throw new DuplicateResourceException("Role already exists: " + name);
        Role role = new Role(name, req.getDescription());
        return RoleResponse.from(roleRepository.save(role));
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(RoleResponse::from)
                .collect(Collectors.toList());
    }
 
    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        return RoleResponse.from(
                roleRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id))
        );
    }
 
    @Override
    public RoleResponse updateRole(Long id, CreateRoleRequest req) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
        String newName = req.getName().trim().toUpperCase();
        // Allow same name (no-op) or check for conflict
        if (!role.getName().equalsIgnoreCase(newName) && roleRepository.existsByNameIgnoreCase(newName)) {
            throw new DuplicateResourceException("Role name already taken: " + newName);
        }
        role.setName(newName);
        if (req.getDescription() != null) role.setDescription(req.getDescription());
        return RoleResponse.from(roleRepository.save(role));
    }
 
    // @Override
    // public void deactivateRole(Long id) {
    //     Role role = roleRepository.findById(id)
    //             .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    //     role.setActive(false);
    //     roleRepository.save(role);
    // }

    // ✅ Replace deactivateRole with this
@Override
public void deleteRole(Long id) {
    Role role = roleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    roleRepository.delete(role); // ✅ hard delete
}
 
}
 