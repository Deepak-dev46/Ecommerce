package com.rvz.masterdataservice.repository;

import com.rvz.masterdataservice.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {
    List<ProjectAssignment> findByUserId(Long userId);
    List<ProjectAssignment> findByProjectId(Long projectId);
}
