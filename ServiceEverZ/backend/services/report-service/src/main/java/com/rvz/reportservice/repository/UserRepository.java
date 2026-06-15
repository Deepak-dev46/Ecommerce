package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>,
        JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmployeeId(Long employeeId);

    boolean existsByEmail(String email);

    List<User> findByStatus(User.UserStatus status);

    @Query("SELECT u.department AS department, COUNT(u) AS count " +
           "FROM User u " +
           "GROUP BY u.department " +
           "ORDER BY COUNT(u) DESC")
    List<Map<String, Object>> countGroupByDepartment();

    @Query("SELECT u.role AS role, COUNT(u) AS count " +
           "FROM User u " +
           "GROUP BY u.role")
    List<Map<String, Object>> countGroupByRole();

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = 'ACTIVE'")
    List<User> findActiveUsersByRole(@Param("role") String role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 'ACTIVE'")
    long countActiveUsers();
}
