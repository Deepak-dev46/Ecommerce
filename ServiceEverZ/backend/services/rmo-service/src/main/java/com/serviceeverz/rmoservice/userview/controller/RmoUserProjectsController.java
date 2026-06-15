package com.serviceeverz.rmoservice.userview.controller;

import com.serviceeverz.rmoservice.assignment.dto.ProjectMemberResponse;
import com.serviceeverz.rmoservice.assignment.service.IProjectAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rmo/users/{userId}/projects")
@PreAuthorize("hasAuthority('RMO')")
public class RmoUserProjectsController {

    private final IProjectAssignmentService assignmentService;

    public RmoUserProjectsController(IProjectAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // ── View all projects a user is assigned to ──
    @GetMapping
    public ResponseEntity<List<ProjectMemberResponse>> getUserProjects(@PathVariable Long userId) {
        return ResponseEntity.ok(assignmentService.getProjectsForUser(userId));
    }
}