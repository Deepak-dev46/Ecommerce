package com.serviceeverz.rmoservice.assignment.service;
 
import com.serviceeverz.rmoservice.assignment.dto.*;
import java.util.List;
 
public interface IProjectAssignmentService {
 
    List<ProjectMemberResponse> assignMembers(Long projectId, AssignMembersRequest req, Long assignedBy);
 
    List<ProjectMemberResponse> getMembersForProject(Long projectId);
 
    List<ProjectMemberResponse> getProjectsForUser(Long userId);
 
    ProjectMemberResponse updateAssignment(Long projectId, Long userId, UpdateAssignmentRequest req);
 
    void removeMember(Long projectId, Long userId);
}