package com.rvz.assignmentservice.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rvz.assignmentservice.dto.ApiResponse;
import com.rvz.assignmentservice.dto.request.AcknowledgeRequest;
import com.rvz.assignmentservice.dto.request.TriggerAssignmentRequest;
import com.rvz.assignmentservice.dto.response.AssignmentResponse;
import com.rvz.assignmentservice.entity.SupportPersonnelCapacity;
import com.rvz.assignmentservice.repository.SupportPersonnelCapacityRepository;
import com.rvz.assignmentservice.repository.TicketAssignmentRepository;
import com.rvz.assignmentservice.service.AssignmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final SupportPersonnelCapacityRepository capacityRepo;
    private final TicketAssignmentRepository ticketAssignmentRepo;
    public AssignmentController(AssignmentService assignmentService,
                                SupportPersonnelCapacityRepository capacityRepo,TicketAssignmentRepository ticketAssignmentRepo) {
        this.assignmentService = assignmentService;
        this.capacityRepo      = capacityRepo;
        this.ticketAssignmentRepo = ticketAssignmentRepo;
    }

    @PostMapping("/trigger")
    public ResponseEntity<ApiResponse<AssignmentResponse>> trigger(
            @Valid @RequestBody TriggerAssignmentRequest request) {
        AssignmentResponse data = assignmentService.triggerAssignment(request);
        ApiResponse<AssignmentResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Ticket assigned successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/workload-summary")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWorkloadSummary() {
        List<SupportPersonnelCapacity> agents = capacityRepo.findByActiveTrue();
 
        List<Map<String, Object>> result = agents.stream().map(agent -> {
            long activeCount = ticketAssignmentRepo
                .findBySupportPersonIdAndStatusNot(agent.getSupportPersonId(), "CLOSED")
                .size();
 
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("supportPersonId",     agent.getSupportPersonId());
            m.put("supportPersonName",   agent.getSupportPersonName());
            m.put("assignedTicketCount", activeCount);
            return m;
        }).toList();
 
        ApiResponse<List<Map<String, Object>>> res = new ApiResponse<>();
        res.setSuccess(true);
        res.setMessage("Workload summary fetched");
        res.setData(result);
        res.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(res);
    }
    @PostMapping("/acknowledge")
    public ResponseEntity<ApiResponse<AssignmentResponse>> acknowledge(
            @Valid @RequestBody AcknowledgeRequest request) {
        AssignmentResponse data = assignmentService.acknowledgeTicket(request);
        ApiResponse<AssignmentResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Ticket acknowledged successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{ticketId}/check-timeout")
    public ResponseEntity<ApiResponse<AssignmentResponse>> checkTimeout(
            @PathVariable Long ticketId) {
        AssignmentResponse data = assignmentService.checkAndReassignIfTimeout(ticketId);
        ApiResponse<AssignmentResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Timeout check completed");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignment(
            @PathVariable Long ticketId) {
        AssignmentResponse data = assignmentService.getAssignment(ticketId);
        ApiResponse<AssignmentResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Assignment fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-person/{supportPersonId}")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getByPerson(
            @PathVariable Long supportPersonId) {
        List<AssignmentResponse> data = assignmentService.getAssignmentsBySupportPerson(supportPersonId);
        ApiResponse<List<AssignmentResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Assignments fetched for support person");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/assignments/capacity/add
    // Called by role-service (via Feign) when admin assigns SUPPORT_PERSONNEL
    // role to a user. Creates a capacity row so auto-assignment can pick them.
    // Body: { "supportPersonId": 5, "supportPersonName": "Deepak Mani" }
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/capacity/add")
    public ResponseEntity<ApiResponse<Void>> addToCapacity(
            @RequestBody Map<String, Object> body) {

        Long personId = body.get("supportPersonId") instanceof Number n
                ? n.longValue()
                : Long.parseLong(body.get("supportPersonId").toString());
        String personName = body.getOrDefault("supportPersonName", "").toString();

        assignmentService.addSupportPersonnelCapacity(personId, personName);

        ApiResponse<Void> res = new ApiResponse<>();
        res.setSuccess(true);
        res.setMessage("Capacity entry added for userId=" + personId);
        res.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(res);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/assignments/capacity/all
    // Returns all active support personnel — used by ManualAssignPage to
    // populate the personnel picker (replaces the user-service user list).
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/capacity/all")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllCapacity() {
        List<SupportPersonnelCapacity> list = capacityRepo.findByActiveTrue();
        List<Map<String, Object>> result = list.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("supportPersonId",   c.getSupportPersonId());
            m.put("supportPersonName", c.getSupportPersonName());
            m.put("active",            c.getActive());
            return m;
        }).toList();

        ApiResponse<List<Map<String, Object>>> res = new ApiResponse<>();
        res.setSuccess(true);
        res.setMessage("Active support personnel fetched");
        res.setData(result);
        res.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(res);
    }
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllAssignments() {
        List<Map<String, Object>> data = assignmentService.getAllAssignments();

        ApiResponse<List<Map<String, Object>>> res = new ApiResponse<>();
        res.setSuccess(true);
        res.setMessage("All assignments fetched");
        res.setData(data);
        res.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(res);
    }

    /**
     * GET /api/assignments/status/{status}
     * Assignments filtered by status: ASSIGNED (not acknowledged) / OPEN (acknowledged) / REASSIGNED
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getByStatus(
            @PathVariable String status) {
        List<AssignmentResponse> data = assignmentService.getAssignmentsByStatus(status);

        ApiResponse<List<AssignmentResponse>> res = new ApiResponse<>();
        res.setSuccess(true);
        res.setMessage("Assignments with status=" + status);
        res.setData(data);
        res.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(res);
    }
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        ApiResponse<String> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Assignment Service is running");
        response.setData("UP");
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
