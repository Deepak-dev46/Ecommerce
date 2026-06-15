package com.serviceeverz.rmoservice.assignment.controller;
 
import com.serviceeverz.rmoservice.assignment.dto.*;
import com.serviceeverz.rmoservice.assignment.service.IProjectAssignmentService;
import com.serviceeverz.rmoservice.project.dto.ProjectResponse;
import com.serviceeverz.rmoservice.project.service.ProjectServiceImpl;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/v1/rmo/projects/{projectId}/members")
//@PreAuthorize("hasAuthority('RMO')")
public class ProjectAssignmentController {
 
    private final IProjectAssignmentService assignmentService;
	private final ProjectServiceImpl projectServiceImpl;
 
    
    public ProjectAssignmentController(IProjectAssignmentService assignmentService,
			ProjectServiceImpl projectServiceImpl) {
		super();
		this.assignmentService = assignmentService;
		this.projectServiceImpl = projectServiceImpl;
	}
    
    @DeleteMapping
    public void deleteProject(@PathVariable Long projectId) {
    	projectServiceImpl.deleteProject(projectId);
    }

	@GetMapping("/{userId}")
	public List<ProjectResponse> getProjectsByUserId(@PathVariable Long userId, @PathVariable Long projectId) {
		System.err.println("I am Test");
		return projectServiceImpl.getProjectsByUserId(userId);
	}
 
    // ── Assign end users (workers) to a project ──
    @PostMapping
    public ResponseEntity<List<ProjectMemberResponse>> assignMembers(
            @PathVariable Long projectId,
            @Valid @RequestBody AssignMembersRequest req,
            @RequestAttribute(value = "userId", required = false) Long rmoId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.assignMembers(projectId, req, rmoId == null ? 0L : rmoId));
    }
 
    // ── Get all members of a project ──
    @GetMapping
    public ResponseEntity<List<ProjectMemberResponse>> getMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(assignmentService.getMembersForProject(projectId));
    }
 
    // ── Update a member's assignment (change PRIMARY/SECONDARY or deactivate) ──
    @PatchMapping("/{userId}")
    public ResponseEntity<ProjectMemberResponse> updateAssignment(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @RequestBody UpdateAssignmentRequest req) {
        return ResponseEntity.ok(assignmentService.updateAssignment(projectId, userId, req));
    }
 
    // ── Remove a member from a project (soft delete) ──
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId,
                                             @PathVariable Long userId) {
        assignmentService.removeMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }
}