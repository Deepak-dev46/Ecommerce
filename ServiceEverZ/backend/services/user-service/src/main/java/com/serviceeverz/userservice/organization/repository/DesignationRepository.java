package com.serviceeverz.userservice.organization.repository;
 
import com.serviceeverz.userservice.organization.entity.DesignationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
import java.util.Optional;
 
public interface DesignationRepository extends JpaRepository<DesignationEntity, Long> {
    List<DesignationEntity> findByActiveTrueOrderByNameAsc();
    List<DesignationEntity> findByDepartmentIdAndActiveTrueOrderByNameAsc(Long departmentId);
    Optional<DesignationEntity> findByNameIgnoreCaseAndDepartmentId(String name, Long departmentId);
    boolean existsByNameIgnoreCaseAndDepartmentId(String name, Long departmentId);
}
 