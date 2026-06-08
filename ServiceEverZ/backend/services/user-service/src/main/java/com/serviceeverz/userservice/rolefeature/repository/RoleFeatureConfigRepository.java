package com.serviceeverz.userservice.rolefeature.repository;
 
import com.serviceeverz.userservice.rolefeature.entity.RoleFeatureConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
import java.util.Optional;
 
@Repository
public interface RoleFeatureConfigRepository extends JpaRepository<RoleFeatureConfig, Long> {
 
    List<RoleFeatureConfig> findByRoleName(String roleName);
 
    Optional<RoleFeatureConfig> findByRoleNameAndFeatureKey(String roleName, String featureKey);
 
    @Query("SELECT r.featureKey FROM RoleFeatureConfig r WHERE r.roleName = :roleName AND r.enabled = true")
    List<String> findEnabledKeysByRole(@Param("roleName") String roleName);
 
    // ✅ Fix: JPQL DELETE needs @Modifying + @Transactional + correct @Param binding
    @Modifying
    @Transactional
    @Query("DELETE FROM RoleFeatureConfig r WHERE r.roleName = :roleName")
    void deleteByRoleName(@Param("roleName") String roleName);
}
 