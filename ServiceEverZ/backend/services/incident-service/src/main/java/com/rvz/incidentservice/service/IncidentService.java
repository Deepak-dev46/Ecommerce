package com.rvz.incidentservice.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.rvz.incidentservice.dto.request.CreateIncidentRequest;
import com.rvz.incidentservice.dto.request.UpdateIncidentRequest;
import com.rvz.incidentservice.dto.response.IncidentResponse;
import com.rvz.incidentservice.entity.IncidentAttachment;

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
    
    void saveAttachment(Long incidentId, MultipartFile file);
    
    /** Retrieve attachment for an incident */
    IncidentAttachment getAttachment(Long incidentId);

}
