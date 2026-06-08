package com.serviceeverz.userservice.usermanagement.repository;
 
import java.util.List;
import java.util.Optional;
 
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
 
import com.serviceeverz.userservice.shared.enums.UserStatus;
import com.serviceeverz.userservice.usermanagement.entity.User;
 
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmployeeId(Long employeeId);
    Optional<User> findByEmployeeId(Long employeeId);
 
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR " +
           "  LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "  LOWER(u.lastName)  LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "  LOWER(u.email)     LIKE LOWER(CONCAT('%',:search,'%'))) " +
           "AND (:department IS NULL OR LOWER(u.department.name) = LOWER(:department)) " +
           "AND (:status IS NULL OR u.status = :status)")
    Page<User> findByFilters(
        @Param("search")     String search,
        @Param("department") String department,
        @Param("status")     UserStatus status,
        Pageable pageable
    );
 
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "  OR LOWER(u.lastName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "  OR LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%'))) " +
           "AND (:department IS NULL OR u.department.name = :department) " +
           "AND (:status IS NULL OR u.status = :status)")
    List<User> findByFiltersNoPaging(
        @Param("search") String search,
        @Param("department") String department,
        @Param("status") UserStatus status
    );
 
    // ── NEW: find all users assigned to a specific manager ────────────────────
    List<User> findByManagerId(Long managerId);
 
    // ── NEW: find all users with a specific managerId that are in given IDs ───
    List<User> findByIdIn(List<Long> ids);
 
    @Query(value = """
        SELECT 
            r.name AS roleName,
            u.employee_id AS employeeId,
            CONCAT(u.first_name, ' ', u.last_name) AS fullName,
            u.email AS email,
            d.name AS department,
            des.name AS designation,
            u.status AS userStatus
        FROM users u
        INNER JOIN user_roles ur ON u.id = ur.user_id
        INNER JOIN roles r ON ur.role_id = r.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN designations des ON u.designation_id = des.id
        ORDER BY r.name, u.first_name
        """, nativeQuery = true)
    List<Object[]> findAllUsersWithRoles();
 
    @Query(value = """
        SELECT 
            r.name AS roleName,
            COUNT(ur.user_id) AS totalUsers
        FROM roles r
        LEFT JOIN user_roles ur ON r.id = ur.role_id
        GROUP BY r.id, r.name
        ORDER BY totalUsers DESC
        """, nativeQuery = true)
    List<Object[]> findRoleWiseCount();
}
 