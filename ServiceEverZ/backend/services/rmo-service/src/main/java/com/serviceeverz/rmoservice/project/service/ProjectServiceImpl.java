package com.serviceeverz.rmoservice.project.service;
 
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.serviceeverz.rmoservice.assignment.dto.UpdateManagersRequest;
import com.serviceeverz.rmoservice.assignment.service.ProjectMemberService;
import com.serviceeverz.rmoservice.client.RoleServiceClient;
import com.serviceeverz.rmoservice.client.UserServiceClient;
import com.serviceeverz.rmoservice.client.dto.MapRoleRequest;
import com.serviceeverz.rmoservice.project.dto.CreateProjectRequest;
import com.serviceeverz.rmoservice.project.dto.ProjectResponse;
import com.serviceeverz.rmoservice.project.dto.UpdateProjectRequest;
import com.serviceeverz.rmoservice.project.entity.Project;
import com.serviceeverz.rmoservice.project.repository.ProjectRepository;
import com.serviceeverz.rmoservice.shared.exception.BusinessException;
import com.serviceeverz.rmoservice.shared.exception.DuplicateResourceException;
import com.serviceeverz.rmoservice.shared.exception.ResourceNotFoundException;
 
@Service
@Transactional
public class ProjectServiceImpl implements IProjectService {
 
    private final ProjectRepository projectRepository;
    private final UserServiceClient userServiceClient;
    private final RoleServiceClient roleServiceClient;
    private final ProjectMemberService projectMemberService;
 
    public ProjectServiceImpl(ProjectRepository projectRepository, UserServiceClient userServiceClient,
			RoleServiceClient roleServiceClient, ProjectMemberService projectMemberService) {
		super();
		this.projectRepository = projectRepository;
		this.userServiceClient = userServiceClient;
		this.roleServiceClient = roleServiceClient;
		this.projectMemberService = projectMemberService;
	}

	private void validateProjectDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BusinessException("Project end date cannot be before project start date");
        }
    }
 
    private void validateUserRole(Long userId, String label, String expectedRole) {
        try {
            boolean active = userServiceClient.isUserActive(userId);
            if (!active) {
                throw new BusinessException(label + " user is not active: " + userId);
            }
 
            boolean hasRole = roleServiceClient.userHasRole(userId, expectedRole);
            if (!hasRole) {
                throw new BusinessException(
                        "User " + userId + " does not have role: " + expectedRole
                                + " (required for " + label + ")");
            }
 
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Could not validate " + label + ": " + e.getMessage());
        }
    }
 
    @Override
    public ProjectResponse createProject(CreateProjectRequest req, Long createdBy) {
 
        if (projectRepository.existsByProjectName(req.getProjectName())) {
            throw new DuplicateResourceException("Project name already exists: " + req.getProjectName());
        }
 
        validateProjectDates(req.getProjectStartDate(), req.getProjectEndDate());
        
        MapRoleRequest l1=new MapRoleRequest();
        l1.setRoleId((long) 6);
        l1.setUserId((long) req.getL1ManagerId());
        
        MapRoleRequest l2=new MapRoleRequest();
        l2.setRoleId((long) 7);
        l2.setUserId((long) req.getL2ManagerId());
        
        MapRoleRequest ro=new MapRoleRequest();
        ro.setRoleId((long) 8);
        ro.setUserId((long) req.getResourceOwnerId());
 
        // roleServiceClient.assignRole(l1);
        // roleServiceClient.assignRole(l2);
        // roleServiceClient.assignRole(ro);

        // ✅ Don't fail project creation if role assignment fails
try { roleServiceClient.assignRole(l1); } catch (Exception e) {
    System.err.println("Warning: Could not assign L1 role: " + e.getMessage());
}
try { roleServiceClient.assignRole(l2); } catch (Exception e) {
    System.err.println("Warning: Could not assign L2 role: " + e.getMessage());
}
try { roleServiceClient.assignRole(ro); } catch (Exception e) {
    System.err.println("Warning: Could not assign RO role: " + e.getMessage());
}
 
        
        Project p = new Project();
        p.setProjectCode(generateProjectCode());
        p.setClient(req.getClient());
        p.setProjectName(req.getProjectName());
        p.setDescription(req.getDescription());
        p.setPractice(req.getPractice());
        p.setBusinessUnit(req.getBusinessUnit());
        p.setRegion(req.getRegion());
        p.setDepartment(req.getDepartment());
        p.setEngagementModel(req.getEngagementModel());
        p.setDisplayName(req.getDisplayName());
        p.setProjectShortName(req.getProjectShortName());
        p.setType(req.getType());
        p.setCategory(req.getCategory());
        p.setClientCostCenter(req.getClientCostCenter());
        p.setCostGroup(req.getCostGroup());
        p.setDivision(req.getDivision());
        p.setClientOwner(req.getClientOwner());
        p.setReportingDetails(req.getReportingDetails());
        p.setCreatedBy(createdBy);
 
        p.setResourceOwnerId(req.getResourceOwnerId());
        p.setL1ManagerId(req.getL1ManagerId());
        p.setL2ManagerId(req.getL2ManagerId());
        p.setProjectStartDate(req.getProjectStartDate());
        p.setProjectEndDate(req.getProjectEndDate());
 
        return ProjectResponse.from(projectRepository.save(p));
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(ProjectResponse::from)
                .collect(Collectors.toList());
    }
 
    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        return ProjectResponse.from(
                projectRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id))
        );
    }
 
    @Override
    public ProjectResponse updateProject(Long id, UpdateProjectRequest req) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
 
        LocalDate effectiveStartDate = req.getProjectStartDate() != null
                ? req.getProjectStartDate()
                : p.getProjectStartDate();
 
        LocalDate effectiveEndDate = req.getProjectEndDate() != null
                ? req.getProjectEndDate()
                : p.getProjectEndDate();
 
        validateProjectDates(effectiveStartDate, effectiveEndDate);
 
        if (req.getClient() != null) p.setClient(req.getClient());
        if (req.getProjectName() != null) p.setProjectName(req.getProjectName());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getPractice() != null) p.setPractice(req.getPractice());
        if (req.getBusinessUnit() != null) p.setBusinessUnit(req.getBusinessUnit());
        if (req.getRegion() != null) p.setRegion(req.getRegion());
        if (req.getDepartment() != null) p.setDepartment(req.getDepartment());
        if (req.getEngagementModel() != null) p.setEngagementModel(req.getEngagementModel());
        if (req.getDisplayName() != null) p.setDisplayName(req.getDisplayName());
        if (req.getProjectShortName() != null) p.setProjectShortName(req.getProjectShortName());
        if (req.getType() != null) p.setType(req.getType());
        if (req.getCategory() != null) p.setCategory(req.getCategory());
        if (req.getClientCostCenter() != null) p.setClientCostCenter(req.getClientCostCenter());
        if (req.getCostGroup() != null) p.setCostGroup(req.getCostGroup());
        if (req.getDivision() != null) p.setDivision(req.getDivision());
        if (req.getProjectStartDate() != null) p.setProjectStartDate(req.getProjectStartDate());
        if (req.getProjectEndDate() != null) p.setProjectEndDate(req.getProjectEndDate());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
        if (req.getClientOwner() != null) p.setClientOwner(req.getClientOwner());
        if (req.getReportingDetails() != null) p.setReportingDetails(req.getReportingDetails());
 
        if (req.getResourceOwnerId() != null) {
            p.setResourceOwnerId(req.getResourceOwnerId());
        }
 
        if (req.getL1ManagerId() != null) {
            p.setL1ManagerId(req.getL1ManagerId());
        }
 
        if (req.getL2ManagerId() != null) {
            p.setL2ManagerId(req.getL2ManagerId());
        }
 
        return ProjectResponse.from(projectRepository.save(p));
    }
 
    @Override
    public ProjectResponse assignOwnership(Long id, UpdateManagersRequest req) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
 
        if (req.getResourceOwnerId() == null) {
            throw new BusinessException("Resource owner ID is required");
        }
        if (req.getL1ManagerId() == null) {
            throw new BusinessException("L1 manager ID is required");
        }
        if (req.getL2ManagerId() == null) {
            throw new BusinessException("L2 manager ID is required");
        }
 
        p.setResourceOwnerId(req.getResourceOwnerId());
        p.setL1ManagerId(req.getL1ManagerId());
        p.setL2ManagerId(req.getL2ManagerId());
 
        return ProjectResponse.from(projectRepository.save(p));
    }
 
    private synchronized String generateProjectCode() {
        Long maxId = projectRepository.findMaxId();
        return "PRJ-" + String.format("%05d", maxId + 1);
    }

	public List<ProjectResponse> getProjectsByUserId(Long userId) {
		List<ProjectResponse> response = new ArrayList<>();
		List<Long> ids =projectMemberService.getProjectIdByUserId(userId);
		for (Long long1 : ids) {
			Project p=projectRepository.findById(long1).orElse(null);
			response.add(ProjectResponse.from(p));
		}
		return response;
	}

	public void deleteProject(Long id) {
		try {
			Project p=projectRepository.findById(id).orElseThrow();
			projectMemberService.deleteAllMembers(id);
			projectRepository.delete(p);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
 