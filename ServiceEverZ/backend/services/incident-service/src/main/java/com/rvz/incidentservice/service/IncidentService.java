package com.rvz.incidentservice.service;

import com.rvz.incidentservice.dto.request.CreateIncidentRequest;
import com.rvz.incidentservice.dto.request.UpdateIncidentRequest;
import com.rvz.incidentservice.dto.response.IncidentResponse;

import java.util.List;

public interface IncidentService {

    /** Create and submit an incident — assigns directly to support personnel */
    IncidentResponse createIncident(CreateIncidentRequest request);

    /** Fetch a single incident by its DB id */
    IncidentResponse getIncident(Long incidentId);

    /** All incidents raised by a user (powers My Tickets) */
    List<IncidentResponse> getIncidentsByUser(Long userId);

    /** All incidents assigned to a support person */
    List<IncidentResponse> getIncidentsByAssignee(Long assignedTo);

    /** Update status, priority, or assignment of an incident */
    IncidentResponse updateIncident(Long incidentId, UpdateIncidentRequest request);

    /** All incidents — for admin/support dashboard */
    List<IncidentResponse> getAllIncidents();
}
