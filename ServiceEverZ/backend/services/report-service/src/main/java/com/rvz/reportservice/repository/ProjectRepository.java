package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>,
        JpaSpecificationExecutor<Project> {

    Optional<Project> findByProjectName(String projectName);

    Optional<Project> findByProjectCode(String projectCode);

    List<Project> findByStatus(Project.ProjectStatus status);

    @Query("SELECT p.status AS status, COUNT(p) AS count " +
           "FROM Project p " +
           "GROUP BY p.status")
    List<Map<String, Object>> countGroupByStatus();

    @Query("SELECT p.ownerName AS owner, COUNT(p) AS projectCount " +
           "FROM Project p " +
           "GROUP BY p.ownerName " +
           "ORDER BY COUNT(p) DESC")
    List<Map<String, Object>> projectsByOwner();

    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = 'ACTIVE'")
    long countActiveProjects();
}
