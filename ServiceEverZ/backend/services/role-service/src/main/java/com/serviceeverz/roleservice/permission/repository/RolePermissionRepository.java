package com.serviceeverz.roleservice.permission.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.serviceeverz.roleservice.permission.entity.RolePermission;
import com.serviceeverz.roleservice.shared.enums.PermissionType;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRole_Id(Long roleId);
    Optional<RolePermission> findByRole_IdAndModuleAndFeatureAndPermissionType(Long roleId, String module, String feature, PermissionType permissionType);
    boolean existsByRole_IdAndModuleAndFeatureAndPermissionType(Long roleId, String module, String feature, PermissionType permissionType);
    void deleteByRole_Id(Long roleId);
}
