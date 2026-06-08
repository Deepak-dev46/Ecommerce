package com.serviceeverz.rmoservice.project.controller;
 
import com.serviceeverz.rmoservice.assignment.dto.UpdateManagersRequest;
import com.serviceeverz.rmoservice.project.dto.CreateProjectRequest;
import com.serviceeverz.rmoservice.project.dto.ProjectResponse;
import com.serviceeverz.rmoservice.project.dto.UpdateProjectRequest;
import com.serviceeverz.rmoservice.project.service.IProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/v1/rmo/projects")
//@PreAuthorize("hasAuthority('RMO')")
public class ProjectController {
 
    private final IProjectService projectService;
 
    public ProjectController(IProjectService projectService) {
        this.projectService = projectService;
    }
 
    @PostMapping
    public ResponseEntity<ProjectResponse> create(
            @Valid @RequestBody CreateProjectRequest req,
            @RequestAttribute(value = "userId", required = false) Long rmoId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(req, rmoId == null ? 0L : rmoId));
    }
 
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }
 
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                  @RequestBody UpdateProjectRequest req) {
        return ResponseEntity.ok(projectService.updateProject(id, req));
    }
 
    @PatchMapping("/{id}/ownership")
    public ResponseEntity<ProjectResponse> assignOwnership(@PathVariable Long id,
                                                           @Valid @RequestBody UpdateManagersRequest req) {
        return ResponseEntity.ok(projectService.assignOwnership(id, req));
    }
}
 