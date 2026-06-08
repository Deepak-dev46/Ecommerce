package com.serviceeverz.userservice.organization.repository;
 
import com.serviceeverz.userservice.organization.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
import java.util.Optional;
 
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Long> {
    Optional<DepartmentEntity> findByNameIgnoreCase(String name);
    List<DepartmentEntity> findByActiveTrueOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}
 