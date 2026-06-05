package com.relevantz.ticketservice.controller;

import com.relevantz.ticketservice.dto.CollaborationDtos.*;
import com.relevantz.ticketservice.service.CollaborationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller — Sub-module 01: Collaboration
 *
 * All endpoints in this controller are SUPPORT-ONLY.
 * The API Gateway / Security config must restrict these routes to
 * roles: SUPPORT_AGENT, L1_AGENT, L2_AGENT, ITSM_MANAGER.
 *
 * End-users must never reach /api/internal-notes/** paths.
 */
@RestController
@RequestMapping("/api/internal-notes")
public class CollaborationController {

    private final CollaborationService collaborationService;

    public CollaborationController(CollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    /**
     * POST /api/internal-notes
     * Add a private work note (with optional @mentions) to a ticket.
     *
     * The frontend sends:
     *  - The note content (may include @AgentName markers from the UI)
     *  - A list of mentionedAgentIds resolved by the @mention dropdown
     *
     * The controller resolves agent details (email) from X-Mentioned-Agents header
     * or a separate user-service call and passes them to the service.
     *
     * For simplicity, mentionedAgents are accepted directly in the body here.
     * In production, resolve them via FeignClient to user-service.
     */
    @PostMapping
    public ResponseEntity<InternalNoteResponse> addInternalNote(
            @Valid @RequestBody AddInternalNoteRequest request,
            @RequestParam(required = false) List<String> mentionEmails) {

        // Build AgentMentionDto list from request mentionedAgentIds
        // In production: call UserServiceClient to resolve id → {fullName, email}
        // Here we accept an optional mentionEmails query param for simplicity
        List<AgentMentionDto> mentionedAgents = buildMentionDtos(
                request.getMentionedAgentIds(), mentionEmails);

        InternalNoteResponse response =
                collaborationService.addInternalNote(request, mentionedAgents);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/internal-notes/{ticketId}
     * Retrieve all work notes for a ticket. Support-role only.
     */
    @GetMapping("/{ticketId}")
    public ResponseEntity<List<InternalNoteResponse>> getInternalNotes(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(collaborationService.getInternalNotes(ticketId));
    }

    /**
     * GET /api/internal-notes/mention-suggestions?query=
     * Returns active support agents matching the search term for @mention dropdown.
     *
     * NOTE: In production this should proxy to user-service with role filter.
     * This endpoint is a placeholder; wire it to your UserServiceClient.
     */
    @GetMapping("/mention-suggestions")
    public ResponseEntity<List<AgentMentionDto>> getMentionSuggestions(
            @RequestParam(defaultValue = "") String query) {
        // TODO: call UserServiceClient.searchSupportAgents(query)
        // Return empty list for now — the frontend shows empty dropdown until wired.
        return ResponseEntity.ok(List.of());
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private List<AgentMentionDto> buildMentionDtos(List<Long> ids, List<String> emails) {
        if (ids == null || ids.isEmpty()) return List.of();
        if (emails == null || emails.size() != ids.size()) return List.of();
        java.util.List<AgentMentionDto> result = new java.util.ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            result.add(new AgentMentionDto(ids.get(i), "Agent", emails.get(i)));
        }
        return result;
    }
}
