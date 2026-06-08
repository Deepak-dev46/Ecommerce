
package com.rvz.assignmentservice.service;

import com.rvz.assignmentservice.dto.request.AcknowledgeRequest;
import com.rvz.assignmentservice.dto.request.TriggerAssignmentRequest;
import com.rvz.assignmentservice.dto.response.AssignmentResponse;

import java.util.List;
import java.util.Map;

public interface AssignmentService {
    AssignmentResponse triggerAssignment(TriggerAssignmentRequest request);
    AssignmentResponse acknowledgeTicket(AcknowledgeRequest request);
    AssignmentResponse checkAndReassignIfTimeout(Long ticketId);
    AssignmentResponse getAssignment(Long ticketId);
    List<AssignmentResponse> getAssignmentsBySupportPerson(Long supportPersonId);

    // Called when admin assigns SUPPORT_PERSONNEL role to a user
    void addSupportPersonnelCapacity(Long userId, String fullName);

    // ── Monitor / ITSM endpoints ─────────────────────────────────────────────
    // Returns all assignment records as maps (for monitor page)
    List<Map<String, Object>> getAllAssignments();

    // Returns assignments filtered by status (ASSIGNED / OPEN / REASSIGNED)
    List<AssignmentResponse> getAssignmentsByStatus(String status);
}

