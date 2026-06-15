package com.serviceeverz.rmoservice.project.repository;
 
import com.serviceeverz.rmoservice.project.entity.Project;
import com.serviceeverz.rmoservice.shared.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
 
import java.util.List;
import java.util.Optional;
 
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
 
    Optional<Project> findByProjectCode(String projectCode);
 
    List<Project> findByStatus(ProjectStatus status);
 
    boolean existsByProjectName(String projectName);
 
    boolean existsByProjectCode(String projectCode);
 
    // ── NEW: used by InternalUserRoleController to derive effective roles ─────
 
    // True if this user is L1 manager on any project NOT in given status
    boolean existsByL1ManagerIdAndStatusNot(Long l1ManagerId, ProjectStatus status);
 
    // True if this user is L2 manager on any project NOT in given status
    boolean existsByL2ManagerIdAndStatusNot(Long l2ManagerId, ProjectStatus status);
 
    // True if this user is resource owner on any project NOT in given status
    boolean existsByResourceOwnerIdAndStatusNot(Long resourceOwnerId, ProjectStatus status);
 
    // ── EXISTING: used by assignment & project services ───────────────────────
    List<Project> findByResourceOwnerId(Long resourceOwnerId);
 
    List<Project> findByL1ManagerId(Long l1ManagerId);
 
    List<Project> findByL2ManagerId(Long l2ManagerId);
 
    @Query("SELECT COALESCE(MAX(p.id), 0) FROM Project p")
    Long findMaxId();
}
 