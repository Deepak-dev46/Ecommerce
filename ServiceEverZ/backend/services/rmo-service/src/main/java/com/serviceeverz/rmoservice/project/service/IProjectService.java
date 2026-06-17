package com.serviceeverz.rmoservice.project.service;
 
import com.serviceeverz.rmoservice.assignment.dto.UpdateManagersRequest;
import com.serviceeverz.rmoservice.project.dto.CreateProjectRequest;
import com.serviceeverz.rmoservice.project.dto.ProjectResponse;
import com.serviceeverz.rmoservice.project.dto.UpdateProjectRequest;
 
import java.util.List;
 
public interface IProjectService {
 
    ProjectResponse createProject(CreateProjectRequest req, Long createdBy);
 
    List<ProjectResponse> getAllProjects();
 
    ProjectResponse getProjectById(Long id);
 
    ProjectResponse updateProject(Long id, UpdateProjectRequest req);
 
    ProjectResponse assignOwnership(Long id, UpdateManagersRequest req);
}
 