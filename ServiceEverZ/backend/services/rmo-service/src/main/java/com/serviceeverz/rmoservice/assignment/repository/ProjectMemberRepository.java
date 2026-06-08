package com.serviceeverz.rmoservice.assignment.repository;
 
import com.serviceeverz.rmoservice.assignment.entity.ProjectMember;
import com.serviceeverz.rmoservice.shared.enums.MembershipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import java.util.List;
import java.util.Optional;
 
@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
 
    List<ProjectMember> findByProjectIdAndActiveTrue(Long projectId);
 
    List<ProjectMember> findByUserIdAndActiveTrue(Long userId);
 
    Optional<ProjectMember> findByProjectIdAndUserIdAndActiveTrue(Long projectId, Long userId);
 
    // Used for duplicate assignment check
    boolean existsByProjectIdAndUserIdAndActiveTrue(Long projectId, Long userId);
 
    // Used for primary project uniqueness check
    boolean existsByUserIdAndMembershipTypeAndActiveTrue(Long userId, MembershipType membershipType);

	void deleteByProjectId(Long projectId);
}
 