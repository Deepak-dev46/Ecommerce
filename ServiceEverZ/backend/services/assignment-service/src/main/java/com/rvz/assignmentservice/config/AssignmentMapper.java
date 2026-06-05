package com.rvz.assignmentservice.config;

import com.rvz.assignmentservice.dto.response.AssignmentResponse;
import com.rvz.assignmentservice.entity.TicketAssignment;
import org.springframework.stereotype.Component;

@Component
public class AssignmentMapper {
    public AssignmentResponse toResponse(TicketAssignment entity) {
        AssignmentResponse dto = new AssignmentResponse();
        dto.setAssignmentId(entity.getAssignmentId());
        dto.setTicketId(entity.getTicketId());
        dto.setSupportPersonId(entity.getSupportPersonId());
        dto.setSupportPersonName(entity.getSupportPersonName());
        dto.setPriority(entity.getPriority());
        dto.setEstimatedHours(entity.getEstimatedHours());
        dto.setResponseTimeHours(entity.getResponseTimeHours());
        dto.setRemainingHours(entity.getRemainingHours());
        dto.setStatus(entity.getStatus());
        dto.setAssignedAt(entity.getAssignedAt());
        dto.setAcknowledgedAt(entity.getAcknowledgedAt());
        dto.setReassigned(entity.getReassigned());
        return dto;
    }
}
