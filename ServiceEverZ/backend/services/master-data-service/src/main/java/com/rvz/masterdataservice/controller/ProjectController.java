package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import com.rvz.masterdataservice.dto.response.ProjectAssignmentResponse;
import com.rvz.masterdataservice.dto.response.ProjectResponse;
import com.rvz.masterdataservice.service.MasterDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/master/projects")
@CrossOrigin(origins="http://localhost:5173/")
public class ProjectController {

    private static final Logger log = LoggerFactory.getLogger(ProjectController.class);

    private final MasterDataService masterDataService;

    public ProjectController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getAllProjects() {
        log.info("GET /api/master/projects");
        List<ProjectResponse> data = masterDataService.getAllProjects();
        ApiResponse<List<ProjectResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Projects fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long id) {
        log.info("GET /api/master/projects/{}", id);
        ProjectResponse data = masterDataService.getProjectById(id);
        ApiResponse<ProjectResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Project fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<ProjectAssignmentResponse>>> getAssignments(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long projectId) {
        log.info("GET /api/master/projects/assignments userId={} projectId={}", userId, projectId);
        List<ProjectAssignmentResponse> data;
        if (userId != null) {
            data = masterDataService.getAssignmentsByUserId(userId);
        } else {
            data = masterDataService.getAssignmentsByProjectId(projectId);
        }
        ApiResponse<List<ProjectAssignmentResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Assignments fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
