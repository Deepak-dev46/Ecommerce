package com.rvz.assignmentservice.repository;

import com.rvz.assignmentservice.entity.SupportPersonnelCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportPersonnelCapacityRepository extends JpaRepository<SupportPersonnelCapacity, Long> {
    List<SupportPersonnelCapacity> findByActiveTrue();
}
