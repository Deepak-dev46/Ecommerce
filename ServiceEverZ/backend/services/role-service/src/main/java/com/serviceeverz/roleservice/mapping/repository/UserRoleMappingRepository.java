package com.serviceeverz.roleservice.mapping.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.serviceeverz.roleservice.mapping.entity.UserRoleMapping;

@Repository
public interface UserRoleMappingRepository extends JpaRepository<UserRoleMapping, Long> {
    List<UserRoleMapping> findByUserIdAndActiveTrue(Long userId);
    boolean existsByUserIdAndRoleIdAndActiveTrue(Long userId, Long roleId);
    Optional<UserRoleMapping> findByUserIdAndRole_IdAndActiveTrue(Long userId, Long roleId);
    @Modifying
    @Query("DELETE FROM UserRoleMapping u WHERE u.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    List<UserRoleMapping> findByRole_IdAndActiveTrue(Long roleId);
    List<UserRoleMapping> findByActiveTrue();

    @Query("SELECT u FROM UserRoleMapping u JOIN FETCH u.role WHERE u.active = true")
List<UserRoleMapping> findAllActiveWithRole();
 
}
