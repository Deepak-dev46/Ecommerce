package com.relevantz.ticketservice.controller;

import com.relevantz.ticketservice.dto.ApiResponse;
import com.relevantz.ticketservice.dto.TicketRelationshipDtos.*;
import com.relevantz.ticketservice.service.TicketRelationshipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import com.relevantz.ticketservice.dto.TicketResponse;  // ✅ FIX: explicit import added
//Added by Team -A

/**
 * REST endpoints for the Sprint-5 Ticket Relationship features.
 *
 * All endpoints sit inside the existing ticket-service — no new service needed.
 *
 * Feature 1 — Merge Duplicate Tickets
 *   GET    /api/tickets/duplicates/pending          → pending duplicate flags
 *   POST   /api/tickets/merge                       → confirm merge
 *   DELETE /api/tickets/duplicates/{scoreId}/dismiss→ dismiss duplicate suggestion
 *
 * Feature 2 — Split Complex Tickets
 *   POST   /api/tickets/{id}/split                  → split into child tickets
 *
 * Feature 3 — Link Related Tickets
 *   POST   /api/tickets/{id}/relationships          → create a link
 *   GET    /api/tickets/{id}/relationships          → list all links for a ticket
 *   DELETE /api/tickets/relationships/{relId}       → remove a link
 *
 * Feature 4 — View Parent-Child Hierarchy
 *   GET    /api/tickets/{id}/hierarchy              → full tree rooted at ticket
 */
@RestController
@RequestMapping(value = "/api/tickets", produces = "application/json")
public class TicketRelationshipController {

    private final TicketRelationshipService service;

    public TicketRelationshipController(TicketRelationshipService service) {
        this.service = service;
    }

    // ── Feature 1: Merge Duplicate Tickets ───────────────────────────────────

    /** Returns all auto-flagged duplicate pairs pending support-agent review. */
    @GetMapping("/duplicates/pending")
    public ResponseEntity<ApiResponse<List<DuplicateFlagResponse>>> getPendingDuplicates() {
        return ResponseEntity.ok(ok("Pending duplicate flags", service.getPendingDuplicates()));
    }

    /**
     * Support agent confirms the merge.
     * Closes the duplicate ticket and creates a DUPLICATE relationship.
     */
    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<Void>> confirmMerge(@RequestBody MergeTicketsRequest req) {
        service.confirmMerge(req);
        return ResponseEntity.ok(ok("Tickets merged successfully", null));
    }

    /**
     * Support agent dismisses the duplicate suggestion (not actually a duplicate).
     */
    @DeleteMapping("/duplicates/{scoreId}/dismiss")
    public ResponseEntity<ApiResponse<Void>> dismissDuplicate(
            @PathVariable Long scoreId,
            @RequestParam(defaultValue = "0") Long reviewedBy) {
        service.dismissDuplicate(scoreId, reviewedBy);
        return ResponseEntity.ok(ok("Suggestion dismissed", null));
    }

    // ── Feature 2: Split Complex Tickets ─────────────────────────────────────

    /**
     * Splits a parent ticket into multiple child tickets.
     * Each element in the request body's `children` list becomes a new ticket.
     */
    @PostMapping("/{id}/split")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> splitTicket(
            @PathVariable Long id,
            @RequestBody SplitTicketRequest req) {
        List<TicketResponse> children = service.splitTicket(id, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ok("Ticket split into " + children.size() + " child tickets", children));
    }

    // ── Feature 3: Link Related Tickets ──────────────────────────────────────

    /** Creates a relationship link from the source ticket to the target ticket. */
    @PostMapping("/{id}/relationships")
    public ResponseEntity<ApiResponse<RelationshipResponse>> linkTickets(
            @PathVariable Long id,
            @RequestBody LinkTicketsRequest req) {
        RelationshipResponse res = service.linkTickets(id, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ok("Tickets linked successfully", res));
    }

    /** Returns all relationships (any type) involving the given ticket. */
    @GetMapping("/{id}/relationships")
    public ResponseEntity<ApiResponse<List<RelationshipResponse>>> getRelationships(
            @PathVariable Long id) {
        return ResponseEntity.ok(ok("Relationships fetched", service.getRelationships(id)));
    }

    /** Removes a specific relationship by its id. */
    @DeleteMapping("/relationships/{relId}")
    public ResponseEntity<ApiResponse<Void>> removeRelationship(@PathVariable Long relId) {
        service.removeRelationship(relId);
        return ResponseEntity.ok(ok("Relationship removed", null));
    }


    /**
     * Re-runs duplicate detection for an existing ticket.
     * Use this for tickets created before the fix (userId/categoryId were null).
     * POST /api/tickets/{id}/detect-duplicates
     */
    @PostMapping("/{id}/detect-duplicates")
    public ResponseEntity<ApiResponse<Void>> retriggerDetection(@PathVariable Long id) {
        service.retriggerDetection(id);
        return ResponseEntity.ok(ok("Duplicate detection re-run for ticket " + id, null));
    }
    // ── Feature 4: View Parent-Child Hierarchy ────────────────────────────────

    /**
     * Returns the complete hierarchy tree for a ticket.
     * Works whether the given ticket is the root (parent) or a child
     * (the service walks up to find the root automatically).
     */
    @GetMapping("/{id}/hierarchy")
    public ResponseEntity<ApiResponse<HierarchyNode>> getHierarchy(@PathVariable Long id) {
        return ResponseEntity.ok(ok("Hierarchy fetched", service.getHierarchy(id)));
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private <T> ApiResponse<T> ok(String message, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setSuccess(true);
        r.setMessage(message);
        r.setData(data);
        r.setTimestamp(LocalDateTime.now());
        return r;
    }

    // ── Import alias — TicketResponse is com.relevantz.ticketservice.dto.TicketResponse ──
    // Add this import at the top of the actual source file:
    //   import com.relevantz.ticketservice.dto.TicketResponse;
}
