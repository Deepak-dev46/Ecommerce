package com.rvz.incidentservice.service.impl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rvz.incidentservice.client.MasterDataClient;
import com.rvz.incidentservice.dto.request.CreateIncidentRequest;
import com.rvz.incidentservice.dto.request.UpdateIncidentRequest;
import com.rvz.incidentservice.dto.response.IncidentResponse;
import com.rvz.incidentservice.entity.Incident;
import com.rvz.incidentservice.exception.ResourceNotFoundException;
import com.rvz.incidentservice.repository.IncidentRepository;
import com.rvz.incidentservice.service.IncidentService;

@Service
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final MasterDataClient   masterDataClient;

    public IncidentServiceImpl(IncidentRepository incidentRepository,
                               MasterDataClient masterDataClient) {
        this.incidentRepository = incidentRepository;
        this.masterDataClient   = masterDataClient;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public IncidentResponse createIncident(CreateIncidentRequest request) {

        Incident incident = new Incident();

        // Identifiers
        incident.setTicketNumber(generateIncidentNumber());
        incident.setTicketType("Incident");

        // Requester
        incident.setUserId(request.getUserId());
        incident.setRequesterName(request.getRequesterName());
        incident.setEmail(request.getEmail());

        // Classification
        incident.setCategoryId(request.getCategoryId());
        incident.setSubCategoryId(request.getSubCategoryId());

        // Core
        incident.setSubject(request.getSubject());
        incident.setDescription(request.getDescription());
        incident.setStatus("New");                   // always New on creation
        incident.setPriority(request.getPriority());

        // Incident-specific
        incident.setBreachByUser(request.getBreachByUser());
        incident.setOccurredAt(request.getOccurredAt());
        incident.setSource(request.getSource());
        incident.setIncidentLocation(request.getIncidentLocation());
        incident.setOfficeLocation(request.getOfficeLocation());
        incident.setAttachmentPath(request.getAttachmentPath());

        // Direct assignment — find support personnel with lowest load.
        // Wrapped in a broad try-catch so a master-service failure
        // NEVER prevents the incident from being saved.
        try {
            assignToSupportPersonnel(incident);
        } catch (Exception e) {
            // Non-fatal: incident saves with assignedTo = null
            // ITSM manager can assign manually later
        }

        // Audit
        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());

        Incident saved = incidentRepository.save(incident);

        // Enrich transient fields
        try {
            enrichWithMasterData(saved,
                    request.getCategoryName(),
                    request.getSubCategoryName());
        } catch (Exception ignored) {}

        return toResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  READ
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public IncidentResponse getIncident(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Incident not found: " + incidentId));
        try { enrichWithMasterData(incident, null, null); } catch (Exception ignored) {}
        return toResponse(incident);
    }

    @Override
    public List<IncidentResponse> getIncidentsByUser(Long userId) {
        return incidentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(i -> {
                    try { enrichWithMasterData(i, null, null); } catch (Exception ignored) {}
                    return toResponse(i);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<IncidentResponse> getIncidentsByAssignee(Long assignedTo) {
        return incidentRepository.findByAssignedToOrderByCreatedAtDesc(assignedTo)
                .stream()
                .map(i -> {
                    try { enrichWithMasterData(i, null, null); } catch (Exception ignored) {}
                    return toResponse(i);
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Auto-assign incident to the active support person with the lightest load.
     *
     * Uses the EXISTING master-service endpoint:
     *   GET /api/master/users?status=ACTIVE
     * Then filters locally for designation == "SUPPORT".
     *
     * This avoids needing the new /api/master/users/support endpoint
     * and works with the current master-service as-is.
     */
    @SuppressWarnings("unchecked")
    private void assignToSupportPersonnel(Incident incident) {
        // getUsers() returns ApiResponse<List<UserResponse>> unwrapped by Feign
        // The MasterDataClient.getUsers() returns Map<String,Object> which is
        // the raw response — we need to pull the "data" list from it.
        Object raw = masterDataClient.getUsers("ACTIVE");

        List<Map<String, Object>> allUsers = Collections.emptyList();
        if (raw instanceof Map) {
            Object data = ((Map<?, ?>) raw).get("data");
            if (data instanceof List) {
                allUsers = (List<Map<String, Object>>) data;
            }
        } else if (raw instanceof List) {
            allUsers = (List<Map<String, Object>>) raw;
        }

        // Filter to SUPPORT designation only
        List<Map<String, Object>> supportUsers = allUsers.stream()
                .filter(u -> "SUPPORT".equalsIgnoreCase(
                        String.valueOf(u.getOrDefault("designation", ""))))
                .collect(Collectors.toList());

        if (supportUsers.isEmpty()) return;

        // Count open incidents per person
        Map<Long, Long> loadMap = incidentRepository.findAll().stream()
                .filter(i -> !"Resolved".equalsIgnoreCase(i.getStatus())
                          && !"Closed".equalsIgnoreCase(i.getStatus())
                          && i.getAssignedTo() != null)
                .collect(Collectors.groupingBy(Incident::getAssignedTo,
                        Collectors.counting()));

        // Pick least loaded
        Map<String, Object> chosen = supportUsers.stream()
                .min((a, b) -> {
                    Long idA = toLong(a.get("id"));
                    Long idB = toLong(b.get("id"));
                    long loadA = loadMap.getOrDefault(idA, 0L);
                    long loadB = loadMap.getOrDefault(idB, 0L);
                    return Long.compare(loadA, loadB);
                })
                .orElse(null);

        if (chosen != null) {
            incident.setAssignedTo(toLong(chosen.get("id")));
            // Try fullName first, fall back to firstName
            String name = String.valueOf(
                    chosen.getOrDefault("fullName",
                    chosen.getOrDefault("firstName", "Support")));
            incident.setAssignedToName(name);
        }
    }

    /** Enrich transient category/subcategory names from master-service */
    private void enrichWithMasterData(Incident incident,
                                      String catNameHint,
                                      String subCatNameHint) {
        if (catNameHint != null && !catNameHint.isBlank()) {
            incident.setCategoryName(catNameHint);
        }
        if (subCatNameHint != null && !subCatNameHint.isBlank()) {
            incident.setSubCategoryName(subCatNameHint);
        }

        if (incident.getCategoryName() == null && incident.getCategoryId() != null) {
            try {
                Map<String, Object> cat =
                        masterDataClient.getCategoryById(incident.getCategoryId());
                if (cat != null)
                    incident.setCategoryName(
                            String.valueOf(cat.getOrDefault("categoryName", "")));
            } catch (Exception ignored) {}
        }
        if (incident.getSubCategoryName() == null && incident.getSubCategoryId() != null) {
            try {
                Map<String, Object> sub =
                        masterDataClient.getSubcategoryById(incident.getSubCategoryId());
                if (sub != null)
                    incident.setSubCategoryName(
                            String.valueOf(sub.getOrDefault("subcategoryName", "")));
            } catch (Exception ignored) {}
        }
    }

    private String generateIncidentNumber() {
        return "INC-" + System.currentTimeMillis()
                + ThreadLocalRandom.current().nextInt(100, 999);
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        try { return Long.parseLong(val.toString()); }
        catch (Exception e) { return null; }
    }

    private IncidentResponse toResponse(Incident i) {
        IncidentResponse r = new IncidentResponse();
        r.setIncidentId(i.getIncidentId());
        r.setTicketNumber(i.getTicketNumber());
        r.setTicketType(i.getTicketType());
        r.setUserId(i.getUserId());
        r.setRequesterName(i.getRequesterName());
        r.setEmail(i.getEmail());
        r.setCategoryId(i.getCategoryId());
        r.setSubCategoryId(i.getSubCategoryId());
        r.setCategoryName(i.getCategoryName());
        r.setSubCategoryName(i.getSubCategoryName());
        r.setSubject(i.getSubject());
        r.setDescription(i.getDescription());
        r.setStatus(i.getStatus());
        r.setPriority(i.getPriority());
        r.setBreachByUser(i.getBreachByUser());
        r.setOccurredAt(i.getOccurredAt());
        r.setSource(i.getSource());
        r.setIncidentLocation(i.getIncidentLocation());
        r.setOfficeLocation(i.getOfficeLocation());
        r.setAttachmentPath(i.getAttachmentPath());
        // r.setAssignedTo(i.getAssignedTo());
        // r.setAssignedToName(i.getAssignedToName());
        // r.setCreatedAt(i.getCreatedAt());
        // r.setUpdatedAt(i.getUpdatedAt());
        // return r;

        r.setAssignedTo(i.getAssignedTo());
        r.setAssignedToName(i.getAssignedToName());
        r.setResolutionNotes(i.getResolutionNotes());
        r.setCreatedAt(i.getCreatedAt());
        r.setUpdatedAt(i.getUpdatedAt());
        return r;
    }

	@Override
public IncidentResponse updateIncident(Long incidentId, UpdateIncidentRequest request) {
    Incident incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + incidentId));
 
    // if ("Closed".equalsIgnoreCase(incident.getStatus())) {
    //     throw new com.rvz.incidentservice.exception.IncidentException("Cannot update a Closed incident");
    // }
 
    if ("Closed".equalsIgnoreCase(incident.getStatus())) {
        throw new com.rvz.incidentservice.exception.IncidentException("Cannot update a Closed incident");
    }
    // When resolving: set status to Pending_User_Ack
    if ("Pending_User_Ack".equalsIgnoreCase(request.getStatus()) ||
        "PENDING_USER_ACK".equalsIgnoreCase(request.getStatus())) {
        request.setStatus("Pending_User_Ack");
    }
    // Partial update — only set non-null fields
    if (request.getStatus()           != null) incident.setStatus(request.getStatus());
    if (request.getPriority()         != null) incident.setPriority(request.getPriority());
    if (request.getAssignedTo()       != null) {
        // Auto-promote from New → In Progress when assigning
        if ("New".equalsIgnoreCase(incident.getStatus())) {
            incident.setStatus("In Progress");
        }
        incident.setAssignedTo(request.getAssignedTo());
    }
    if (request.getAssignedToName()   != null) incident.setAssignedToName(request.getAssignedToName());
    if (request.getBreachByUser()     != null) incident.setBreachByUser(request.getBreachByUser());
    if (request.getIncidentLocation() != null) incident.setIncidentLocation(request.getIncidentLocation());
    if (request.getOfficeLocation()   != null) incident.setOfficeLocation(request.getOfficeLocation());
    if (request.getAttachmentPath()   != null) incident.setAttachmentPath(request.getAttachmentPath());
     
    if (request.getResolutionNotes()  != null) incident.setResolutionNotes(request.getResolutionNotes());


    incident.setUpdatedAt(LocalDateTime.now());
    Incident saved = incidentRepository.save(incident);
 
    try { enrichWithMasterData(saved, null, null); } catch (Exception ignored) {}
 
    return toResponse(saved);
}
 
@Override
public List<IncidentResponse> getAllIncidents() {
    return incidentRepository.findAll()
            .stream()
            .map(i -> {
                try { enrichWithMasterData(i, null, null); } catch (Exception ignored) {}
                return toResponse(i);
            })
            .collect(Collectors.toList());
}

}
