package com.relevantz.ticketservice.controller;
 
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.relevantz.ticketservice.client.UserServiceClient;
import com.relevantz.ticketservice.dto.CollaborationDtos.*;
import com.relevantz.ticketservice.dto.CollaborationDtos.AddInternalNoteRequest;
import com.relevantz.ticketservice.dto.CollaborationDtos.AgentMentionDto;
import com.relevantz.ticketservice.dto.CollaborationDtos.InternalNoteResponse;
import com.relevantz.ticketservice.service.CollaborationService;

import jakarta.validation.Valid;
 
@RestController
@RequestMapping("/api/internal-notes")
public class CollaborationController {
 
    private final CollaborationService collaborationService;
    private final UserServiceClient userServiceClient;
 
    public CollaborationController(CollaborationService collaborationService,
                                   UserServiceClient userServiceClient) {
        this.collaborationService = collaborationService;
        this.userServiceClient    = userServiceClient;
    }
 
    @PostMapping
    public ResponseEntity<InternalNoteResponse> addInternalNote(
            @Valid @RequestBody AddInternalNoteRequest request) {
 
        // Resolve each mentioned agent's fullName + email from user-service
        List<AgentMentionDto> mentionedAgents = new ArrayList<>();
 
        if (request.getMentionedAgentIds() != null) {
            for (Long agentId : request.getMentionedAgentIds()) {
                try {
                    Map<String, Object> user = userServiceClient.getUserById(agentId);
 
                    String fullName = (String) user.getOrDefault("fullName", "");
                    if (fullName.isBlank()) {
                        String first = (String) user.getOrDefault("firstName", "");
                        String last  = (String) user.getOrDefault("lastName", "");
                        fullName = (first + " " + last).trim();
                    }
                    String email = (String) user.getOrDefault("email", "");
 
                    if (!email.isBlank()) {
                        mentionedAgents.add(new AgentMentionDto(agentId, fullName, email));
                    }
                } catch (Exception e) {
                    System.err.println("[CollaborationController] Could not resolve agent "
                            + agentId + ": " + e.getMessage());
                }
            }
        }
 
        InternalNoteResponse response =
                collaborationService.addInternalNote(request, mentionedAgents);
        return ResponseEntity.ok(response);
    }
 
    @GetMapping("/{ticketId}")
    public ResponseEntity<List<InternalNoteResponse>> getInternalNotes(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(collaborationService.getInternalNotes(ticketId));
    }
 
    @GetMapping("/mention-suggestions")
    public ResponseEntity<List<AgentMentionDto>> getMentionSuggestions(
            @RequestParam(defaultValue = "") String query) {
        return ResponseEntity.ok(collaborationService.getMentionSuggestions(query));
    }
}
 