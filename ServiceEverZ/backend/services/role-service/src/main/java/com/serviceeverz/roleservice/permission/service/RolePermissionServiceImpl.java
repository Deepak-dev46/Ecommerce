package com.serviceeverz.roleservice.permission.service;
 
import com.serviceeverz.roleservice.entity.Role;
import com.serviceeverz.roleservice.permission.dto.BulkPermissionRequest;
import com.serviceeverz.roleservice.permission.dto.RolePermissionRequest;
import com.serviceeverz.roleservice.permission.dto.RolePermissionResponse;
import com.serviceeverz.roleservice.permission.entity.RolePermission;
import com.serviceeverz.roleservice.permission.repository.RolePermissionRepository;
import com.serviceeverz.roleservice.role.repository.RoleRepository;
import com.serviceeverz.roleservice.shared.enums.PermissionType;
import com.serviceeverz.roleservice.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
 
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
 
@Service
public class RolePermissionServiceImpl implements IRolePermissionService {
 
    private final RolePermissionRepository permRepo;
    private final RoleRepository roleRepo;
 
    public RolePermissionServiceImpl(RolePermissionRepository permRepo, RoleRepository roleRepo) {
        this.permRepo = permRepo;
        this.roleRepo = roleRepo;
    }
 
    // ─── Single Permission Save ───────────────────────────────────────────────
    @Override
    public RolePermissionResponse savePermission(RolePermissionRequest req) {
        Role role = roleRepo.findById(req.getRoleId())
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + req.getRoleId()));
 
        Optional<RolePermission> existing = permRepo
            .findByRole_IdAndModuleAndFeatureAndPermissionType(
                req.getRoleId(),
                req.getModule(),
                req.getFeature(),
                req.getPermissionType()
            );
 
        RolePermission perm = existing.orElse(
            new RolePermission(
                role,
                req.getModule(),
                req.getFeature(),
                req.getPermissionType(),
                req.isGranted()
            )
        );
 
        perm.setGranted(req.isGranted());
        perm.setPermissionName(req.getModule() + "_" + req.getFeature()); // ✅ FIXED
        perm.setRole(role);
 
        return RolePermissionResponse.from(permRepo.save(perm));
    }
 
    // ─── Bulk Permission Save ─────────────────────────────────────────────────
    @Override
    public List<RolePermissionResponse> savePermissionsBulk(BulkPermissionRequest req) {
        Role role = roleRepo.findById(req.getRoleId())
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + req.getRoleId()));
 
        List<RolePermissionResponse> responses = new ArrayList<>();
 
        for (String feature : req.getFeatures()) {
            Optional<RolePermission> existing = permRepo
                .findByRole_IdAndModuleAndFeatureAndPermissionType(
                    req.getRoleId(),
                    req.getModule(),
                    feature,
                    req.getPermissionType()
                );
 
            RolePermission perm = existing.orElse(
                new RolePermission(
                    role,
                    req.getModule(),
                    feature,
                    req.getPermissionType(),
                    req.isGranted()
                )
            );
 
            perm.setGranted(req.isGranted());
            perm.setPermissionName(req.getModule() + "_" + feature); // ✅ FIXED
            perm.setRole(role);
 
            responses.add(RolePermissionResponse.from(permRepo.save(perm)));
        }
 
        return responses;
    }
 
    // ─── Get Permissions for Role ─────────────────────────────────────────────
    @Override
    public List<RolePermissionResponse> getPermissionsForRole(Long roleId) {
        return permRepo.findByRole_Id(roleId)
            .stream()
            .map(RolePermissionResponse::from)
            .toList();
    }
 
    // ─── Check Permission ─────────────────────────────────────────────────────
    @Override
    public boolean hasPermission(Long roleId, String module, String feature, PermissionType type) {
        return permRepo
            .findByRole_IdAndModuleAndFeatureAndPermissionType(roleId, module, feature, type)
            .map(RolePermission::isGranted)
            .orElse(false);
    }
}
 