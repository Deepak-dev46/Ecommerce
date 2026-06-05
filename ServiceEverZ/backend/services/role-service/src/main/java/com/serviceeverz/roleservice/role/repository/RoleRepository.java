package com.serviceeverz.roleservice.role.repository;
 
import com.serviceeverz.roleservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
 
import java.util.Optional;
 
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
 
    // Was findByName(RoleName) — now String
    Optional<Role> findByNameIgnoreCase(String name);
 
    boolean existsByNameIgnoreCase(String name);
 
    // Keep the existing delete helper (unchanged)
    @Modifying
    @Query("DELETE FROM UserRole ur WHERE ur.userId = :userId AND ur.roleId = :roleId")
    void deleteByUserId(@Param("userId") Long userId, @Param("roleId") Long roleId);
}
 