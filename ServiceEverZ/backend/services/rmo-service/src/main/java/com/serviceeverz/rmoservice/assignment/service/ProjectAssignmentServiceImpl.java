package com.serviceeverz.rmoservice.assignment.service;
 
import com.serviceeverz.rmoservice.assignment.dto.*;
import com.serviceeverz.rmoservice.assignment.entity.ProjectMember;
import com.serviceeverz.rmoservice.assignment.repository.ProjectMemberRepository;
import com.serviceeverz.rmoservice.client.UserServiceClient;
import com.serviceeverz.rmoservice.project.repository.ProjectRepository;
import com.serviceeverz.rmoservice.shared.enums.MembershipType;
import com.serviceeverz.rmoservice.shared.exception.BusinessException;
import com.serviceeverz.rmoservice.shared.exception.DuplicateResourceException;
import com.serviceeverz.rmoservice.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@Transactional
public class ProjectAssignmentServiceImpl implements IProjectAssignmentService {
 
    private final ProjectMemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final UserServiceClient userServiceClient;
 
    public ProjectAssignmentServiceImpl(ProjectMemberRepository memberRepository,
                                        ProjectRepository projectRepository,
                                        UserServiceClient userServiceClient) {
        this.memberRepository = memberRepository;
        this.projectRepository = projectRepository;
        this.userServiceClient = userServiceClient;
    }
 
    // ── Validates user is active ──
    private void validateUserActive(Long userId, String label) {
        try {
            boolean active = userServiceClient.isUserActive(userId);
            if (!active)
                throw new BusinessException(label + " is not active: " + userId);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(
                    "Could not verify " + label + " status for userId: " + userId);
        }
    }
 
    @Override
    public List<ProjectMemberResponse> assignMembers(Long projectId,
                                                     AssignMembersRequest req,
                                                     Long assignedBy) {
 
        if (!projectRepository.existsById(projectId))
            throw new ResourceNotFoundException("Project not found: " + projectId);
 
        List<ProjectMemberResponse> responses = new ArrayList<>();
 
        for (MemberAssignment member : req.getMembers()) {
            validateUserActive(member.getUserId(), "Member");
 
            if (memberRepository.existsByProjectIdAndUserIdAndActiveTrue(
                    projectId, member.getUserId()))
                throw new DuplicateResourceException(
                        "User " + member.getUserId() +
                        " is already assigned to project " + projectId);
 
            if (member.getMembershipType() == MembershipType.PRIMARY) {
                boolean alreadyHasPrimary = memberRepository
                        .existsByUserIdAndMembershipTypeAndActiveTrue(
                                member.getUserId(), MembershipType.PRIMARY);
                if (alreadyHasPrimary)
                    throw new BusinessException(
                            "User " + member.getUserId() +
                            " already has a primary project. Assign as SECONDARY.");
            }
 
            ProjectMember pm = new ProjectMember(
                    projectId, member.getUserId(), member.getMembershipType(), assignedBy);
            responses.add(ProjectMemberResponse.from(memberRepository.save(pm)));
        }
 
        return responses;
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getMembersForProject(Long projectId) {
        if (!projectRepository.existsById(projectId))
            throw new ResourceNotFoundException("Project not found: " + projectId);
 
        return memberRepository.findByProjectIdAndActiveTrue(projectId)
                .stream()
                .map(ProjectMemberResponse::from)
                .collect(Collectors.toList());
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getProjectsForUser(Long userId) {
        return memberRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(ProjectMemberResponse::from)
                .collect(Collectors.toList());
    }
 
    @Override
    public ProjectMemberResponse updateAssignment(Long projectId, Long userId,
                                                  UpdateAssignmentRequest req) {
        ProjectMember pm = memberRepository
                .findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active assignment not found for user " + userId +
                        " in project " + projectId));
 
        if (req.getMembershipType() == MembershipType.PRIMARY) {
            boolean alreadyHasPrimary = memberRepository
                    .existsByUserIdAndMembershipTypeAndActiveTrue(
                            userId, MembershipType.PRIMARY);
            if (alreadyHasPrimary && pm.getMembershipType() != MembershipType.PRIMARY)
                throw new BusinessException(
                        "User " + userId +
                        " already has a primary project. Cannot change to PRIMARY.");
        }
 
        if (req.getMembershipType() != null)
            pm.setMembershipType(req.getMembershipType());
        if (req.getActive() != null)
            pm.setActive(req.getActive());
 
        return ProjectMemberResponse.from(memberRepository.save(pm));
    }
 
    @Override
    public void removeMember(Long projectId, Long userId) {
        ProjectMember pm = memberRepository
                .findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active assignment not found for user " + userId +
                        " in project " + projectId));
        pm.setActive(false);
        memberRepository.delete(pm);
    }
 
    // updateManagers removed — L1/L2 are now managed via ProjectServiceImpl
}