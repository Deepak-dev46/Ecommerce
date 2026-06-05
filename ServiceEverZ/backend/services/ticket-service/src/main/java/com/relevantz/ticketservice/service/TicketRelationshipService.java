package com.relevantz.ticketservice.service;

import com.relevantz.ticketservice.dto.TicketRelationshipDtos.*;
import com.relevantz.ticketservice.exception.BadRequestException;
import com.relevantz.ticketservice.exception.ResourceNotFoundException;
import com.relevantz.ticketservice.model.*;
import com.relevantz.ticketservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.relevantz.ticketservice.dto.TicketResponse;  // ✅ FIX: explicit import added
//Added by Team - A

/**
 * Business logic for the four Sprint-5 ticket-management features.
 *
 * REUSES the existing ticket-service — NO new microservice needed.
 * All four features operate on the Ticket entity and two new tables
 * (ticket_relationship, ticket_duplicate_score).
 *
 * Feature 1 – Merge Duplicate Tickets
 * Feature 2 – Split Complex Tickets into Child Tickets
 * Feature 3 – Link Related Tickets
 * Feature 4 – View Parent-Child Ticket Hierarchy
 */
@Service
@Transactional
public class TicketRelationshipService {

    // ── THRESHOLD for auto-flagging (0-100) ──────────────────────────────────
    private static final int DUPLICATE_THRESHOLD = 70;

    private final TicketRepository              ticketRepo;
    private final TicketRelationshipRepository  relationshipRepo;
    private final DuplicateScoreRepository      duplicateScoreRepo;
    private final TicketHistoryRepository       historyRepo;

    public TicketRelationshipService(TicketRepository ticketRepo,
                                     TicketRelationshipRepository relationshipRepo,
                                     DuplicateScoreRepository duplicateScoreRepo,
                                     TicketHistoryRepository historyRepo) {
        this.ticketRepo         = ticketRepo;
        this.relationshipRepo   = relationshipRepo;
        this.duplicateScoreRepo = duplicateScoreRepo;
        this.historyRepo        = historyRepo;
    }

    // =========================================================================
    // FEATURE 1 — Merge Duplicate Tickets
    // =========================================================================

    /**
     * Called internally right after a new ticket is saved.
     * Compares the new ticket against all open tickets of the same user
     * and stores a DuplicateScore row for pairs that exceed the threshold.
     */
    public void runDuplicateDetection(Ticket newTicket) {
        List<Ticket> candidates = ticketRepo
                .findByUserIdOrderByUpdatedAtDesc(newTicket.getUserId())
                .stream()
                .filter(t -> !t.getTicketId().equals(newTicket.getTicketId()))
                .filter(t -> t.getStatus() == TicketStatus.OPEN
                          || t.getStatus() == TicketStatus.IN_PROGRESS)
                .collect(Collectors.toList());

        for (Ticket candidate : candidates) {
            // Skip if a score record already exists for this pair
            if (duplicateScoreRepo.existsPair(
        candidate.getTicketId(),
        newTicket.getTicketId())) {
    continue;
}
 

            int score = computeDuplicateScore(candidate, newTicket);

            if (score > 0) {
                DuplicateScore ds = new DuplicateScore();
               Long first = Math.min(
        candidate.getTicketId(),
        newTicket.getTicketId());
 
Long second = Math.max(
        candidate.getTicketId(),
        newTicket.getTicketId());
 
ds.setOriginalTicketId(first);
ds.setDuplicateTicketId(second);
 
 
                ds.setScore(score);
                ds.setAutoFlagged(score >= DUPLICATE_THRESHOLD);
                duplicateScoreRepo.save(ds);
            }
        }
    }

    /**
     * Composite similarity scorer (0–100).
     *
     * Weights:
     *   Same category           → +20
     *   Same sub-category       → +10
     *   Same item               → +10
     *   Same asset              → +10
     *   Subject similarity      → up to +30  (Jaccard on words)
     *   Description similarity  → up to +20  (Jaccard on words)
     */
    private int computeDuplicateScore(Ticket existing, Ticket incoming) {
        int score = 0;

        // Category match
        if (existing.getCategoryId() != null
                && existing.getCategoryId().equals(incoming.getCategoryId())) {
            score += 20;
        }

        // Sub-category match
        if (existing.getSubCategoryId() != null
                && existing.getSubCategoryId().equals(incoming.getSubCategoryId())) {
            score += 10;
        }

        // Item match
        if (existing.getItemId() != null
                && existing.getItemId().equals(incoming.getItemId())) {
            score += 10;
        }

        // Asset match
        if (existing.getAssetId() != null
                && existing.getAssetId().equals(incoming.getAssetId())) {
            score += 10;
        }

        // Subject similarity (Jaccard on lowercased words)
        score += (int) (jaccardSimilarity(existing.getSubject(), incoming.getSubject()) * 30);

        // Description similarity
        score += (int) (jaccardSimilarity(existing.getDescription(), incoming.getDescription()) * 20);

        return Math.min(score, 100);
    }

    /** Jaccard similarity on word sets: |A ∩ B| / |A ∪ B|, range [0.0, 1.0]. */
    private double jaccardSimilarity(String a, String b) {
        if (a == null || b == null || a.isBlank() || b.isBlank()) return 0.0;
        Set<String> setA = new HashSet<>(Arrays.asList(a.toLowerCase().split("\\W+")));
        Set<String> setB = new HashSet<>(Arrays.asList(b.toLowerCase().split("\\W+")));
        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);
        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    /** Returns all pending duplicate-score pairs not yet reviewed. */
    @Transactional(readOnly = true)
    public List<DuplicateFlagResponse> getPendingDuplicates() {
        return duplicateScoreRepo.findPendingReview().stream()
                .map(ds -> {
                    Ticket original = ticketRepo.findById(ds.getOriginalTicketId()).orElse(null);
                    Ticket dup      = ticketRepo.findById(ds.getDuplicateTicketId()).orElse(null);
                    return DuplicateFlagResponse.from(ds, original, dup);
                })
                .collect(Collectors.toList());
    }

    /**
     * Confirms a merge: marks the duplicate ticket as CLOSED,
     * links the two tickets as DUPLICATE, and marks the score record confirmed.
     * Comments and history from the duplicate are NOT migrated here to keep
     * the implementation simple; that can be a future iteration.
     */
    
    
    public void confirmMerge(MergeTicketsRequest req) {

        Ticket original  = findOrThrow(req.getOriginalTicketId());
        Ticket duplicate = findOrThrow(req.getDuplicateTicketId());

        if (duplicate.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Duplicate ticket is already closed.");
        }

        // Close the duplicate
        duplicate.setStatus(TicketStatus.CLOSED);
        duplicate.setResolutionNotes("Closed as duplicate of " + original.getTicketNumber());
        ticketRepo.save(duplicate);

        // Record history on both tickets
        recordHistory(duplicate, TicketStatus.CLOSED,
                "Merged into " + original.getTicketNumber(), req.getMergedBy(), "Support Agent");
        recordHistory(original, original.getStatus(),
                "Duplicate " + duplicate.getTicketNumber() + " merged into this ticket",
                req.getMergedBy(), "Support Agent");

        // Create a DUPLICATE relationship
        ensureRelationship(duplicate.getTicketId(), original.getTicketId(),
                RelationshipType.DUPLICATE, req.getMergedBy(), null);

        // Mark the score record as confirmed
        duplicateScoreRepo.findByOriginalTicketIdAndDismissedFalse(original.getTicketId())
                .stream()
                .filter(ds -> ds.getDuplicateTicketId().equals(duplicate.getTicketId()))
                .forEach(ds -> {
                    ds.setMergeConfirmed(true);
                    ds.setReviewedBy(req.getMergedBy());
                    ds.setReviewedAt(LocalDateTime.now());
                    duplicateScoreRepo.save(ds);
                });
    }

    /** Dismisses a duplicate suggestion without merging. */
    public void dismissDuplicate(Long scoreId, Long reviewedBy) {
        DuplicateScore ds = duplicateScoreRepo.findById(scoreId)
                .orElseThrow(() -> new ResourceNotFoundException("Score record not found: " + scoreId));
        ds.setDismissed(true);
        ds.setReviewedBy(reviewedBy);
        ds.setReviewedAt(LocalDateTime.now());
        duplicateScoreRepo.save(ds);
    }

    // =========================================================================
    // FEATURE 2 — Split Complex Ticket into Child Tickets
    // =========================================================================

    /**
     * Splits a parent ticket into N child tickets (one per task).
     * Each child inherits the parent's type/category/subcategory/user/priority.
     * PARENT_CHILD relationships are stored in ticket_relationship.
     * The parent ticket status changes to IN_PROGRESS (it stays open until all
     * children are resolved — see autoCloseParentIfAllChildrenResolved).
     */
    public List<TicketResponse> splitTicket(Long parentId, SplitTicketRequest req) {

        Ticket parent = findOrThrow(parentId);

        if (parent.getStatus() == TicketStatus.CLOSED
                || parent.getStatus() == TicketStatus.CANCELLED) {
            throw new BadRequestException("Cannot split a closed or cancelled ticket.");
        }
        if (req.getChildren() == null || req.getChildren().isEmpty()) {
            throw new BadRequestException("At least one child ticket spec must be provided.");
        }

        List<TicketResponse> created = new ArrayList<>();
        int childIndex = 1;

        for (ChildTicketSpec spec : req.getChildren()) {
            Ticket child = new Ticket();
            // Inherit hierarchy from parent
            child.setTypeId(parent.getTypeId());
            child.setTypeName(parent.getTypeName());
            child.setCategoryId(parent.getCategoryId());
            child.setCategoryName(parent.getCategoryName());
            child.setSubCategoryId(parent.getSubCategoryId());
            child.setSubCategoryName(parent.getSubCategoryName());
            child.setItemId(parent.getItemId());
            child.setItemName(parent.getItemName());
            child.setPriority(parent.getPriority());
            child.setUserId(parent.getUserId());
            child.setRequesterName(parent.getRequesterName());
            child.setLocation(parent.getLocation());
            child.setProjectId(parent.getProjectId());

            child.setSubject(spec.getSubject());
            child.setDescription(spec.getDescription() != null
                    ? spec.getDescription()
                    : spec.getSubject());
            // Ticket number pattern: parent-number + child index
            child.setTicketNumber(parent.getTicketNumber() + "-" + childIndex);
            child.setStatus(TicketStatus.OPEN);

            LocalDateTime now = LocalDateTime.now();
            child.setSlaStartTime(now);
            child.setSlaBreached(false);

            Ticket savedChild = ticketRepo.save(child);

            // Link child → parent as PARENT_CHILD
            ensureRelationship(savedChild.getTicketId(), parentId,
                    RelationshipType.PARENT_CHILD, req.getSplitBy(),
                    "Created by splitting " + parent.getTicketNumber());

            recordHistory(savedChild, TicketStatus.OPEN,
                    "Child ticket created by splitting " + parent.getTicketNumber(),
                    req.getSplitBy(), "Support Agent");

            created.add(TicketResponse.from(savedChild,
                    List.of(), List.of(), List.of(), List.of(), null));
            childIndex++;
        }

        // Update parent status
        parent.setStatus(TicketStatus.IN_PROGRESS);
        ticketRepo.save(parent);
        recordHistory(parent, TicketStatus.IN_PROGRESS,
                "Ticket split into " + req.getChildren().size() + " child tickets",
                req.getSplitBy(), "Support Agent");

        return created;
    }

    /**
     * Called by TicketService.updateTicketStatus() when a child ticket is RESOLVED.
     * If ALL children of the parent are now resolved/closed, closes the parent too.
     */
    public void autoCloseParentIfAllChildrenResolved(Long childTicketId) {
        // Find the parent of this child
        List<TicketRelationship> parentLinks = relationshipRepo
                .findBySourceTicketIdAndRelationshipType(
                        childTicketId, RelationshipType.PARENT_CHILD)
                // Actually finds all PARENT_CHILD where THIS ticket is the source (child)
                ;
        // Note: source=child, target=parent  (see Feature 2 split logic above)
        if (parentLinks.isEmpty()) return;

        Long parentId = parentLinks.get(0).getTargetTicketId();
        Ticket parent = ticketRepo.findById(parentId).orElse(null);
        if (parent == null || parent.getStatus() == TicketStatus.CLOSED) return;

        // Find all sibling children
        List<TicketRelationship> siblingLinks = relationshipRepo
                .findByTargetTicketIdAndRelationshipType(parentId, RelationshipType.PARENT_CHILD);

        boolean allDone = siblingLinks.stream().allMatch(link -> {
            Ticket sibling = ticketRepo.findById(link.getSourceTicketId()).orElse(null);
            return sibling != null
                    && (sibling.getStatus() == TicketStatus.RESOLVED
                        || sibling.getStatus() == TicketStatus.CLOSED);
        });

        if (allDone) {
            parent.setStatus(TicketStatus.RESOLVED);
            parent.setResolutionNotes("Auto-resolved: all child tickets resolved.");
            ticketRepo.save(parent);
            recordHistory(parent, TicketStatus.RESOLVED,
                    "Auto-resolved — all child tickets are done.", 0L, "System");
        }
    }

    // =========================================================================
    // FEATURE 3 — Link Related Tickets
    // =========================================================================

    /**
     * Creates a directional link between two tickets.
     * For DUPLICATE: also triggers merge logic (delegates to confirmMerge).
     * For DEPENDS_ON: when the target is later resolved, dependent tickets are updated.
     */
    public RelationshipResponse linkTickets(Long sourceTicketId, LinkTicketsRequest req) {

        findOrThrow(sourceTicketId);
        findOrThrow(req.getTargetTicketId());

        if (sourceTicketId.equals(req.getTargetTicketId())) {
            throw new BadRequestException("A ticket cannot be linked to itself.");
        }

        // For DUPLICATE, delegate to the proper merge flow instead of just creating a link
        if (req.getRelationshipType() == RelationshipType.DUPLICATE) {
            MergeTicketsRequest mergeReq = new MergeTicketsRequest();
            mergeReq.setOriginalTicketId(req.getTargetTicketId());
            mergeReq.setDuplicateTicketId(sourceTicketId);
            mergeReq.setMergedBy(req.getCreatedBy());
            confirmMerge(mergeReq);
            // Return a synthetic response describing the created DUPLICATE link
        }

        TicketRelationship saved = ensureRelationship(
                sourceTicketId, req.getTargetTicketId(),
                req.getRelationshipType(), req.getCreatedBy(), req.getNotes());

        String srcNum = ticketRepo.findById(sourceTicketId)
                .map(Ticket::getTicketNumber).orElse("?");
        String tgtNum = ticketRepo.findById(req.getTargetTicketId())
                .map(Ticket::getTicketNumber).orElse("?");

        return RelationshipResponse.from(saved, srcNum, tgtNum);
    }

    /** Returns all relationships involving a given ticket. */
    @Transactional(readOnly = true)
    public List<RelationshipResponse> getRelationships(Long ticketId) {
        return relationshipRepo.findAllInvolving(ticketId).stream()
                .map(r -> {
                    String srcNum = ticketRepo.findById(r.getSourceTicketId())
                            .map(Ticket::getTicketNumber).orElse("?");
                    String tgtNum = ticketRepo.findById(r.getTargetTicketId())
                            .map(Ticket::getTicketNumber).orElse("?");
                    return RelationshipResponse.from(r, srcNum, tgtNum);
                })
                .collect(Collectors.toList());
    }

    /** Removes a link between two tickets. */
    public void removeRelationship(Long relationshipId) {
        if (!relationshipRepo.existsById(relationshipId)) {
            throw new ResourceNotFoundException("Relationship not found: " + relationshipId);
        }
        relationshipRepo.deleteById(relationshipId);
    }

    /**
     * When a root ticket (DEPENDS_ON) is resolved, update all tickets that depend on it.
     * Called from TicketService.updateTicketStatus() when status → RESOLVED.
     */
    public void propagateDependencyResolution(Long resolvedTicketId) {
        // Find tickets that DEPEND_ON the resolved ticket
        List<TicketRelationship> dependents = relationshipRepo
                .findByTargetTicketId(resolvedTicketId)
                .stream()
                .filter(r -> r.getRelationshipType() == RelationshipType.DEPENDS_ON)
                .collect(Collectors.toList());

        for (TicketRelationship rel : dependents) {
            Ticket dependent = ticketRepo.findById(rel.getSourceTicketId()).orElse(null);
            if (dependent == null) continue;
            if (dependent.getStatus() == TicketStatus.ON_HOLD) {
                dependent.setStatus(TicketStatus.OPEN);
                ticketRepo.save(dependent);
                recordHistory(dependent, TicketStatus.OPEN,
                        "Blocking ticket resolved — this ticket is now unblocked.",
                        0L, "System");
            }
        }
    }

    // =========================================================================
    // FEATURE 4 — View Parent-Child Ticket Hierarchy
    // =========================================================================

    /**
     * Builds and returns the full hierarchy tree rooted at the given ticket.
     * The ticket may be a parent (with children) or a child (in which case we
     * walk up to find the true root before building the tree).
     */
    @Transactional(readOnly = true)
    public HierarchyNode getHierarchy(Long ticketId) {

        // Walk upward to the root
        Long rootId = findRootId(ticketId);
        return buildNode(rootId, null);
    }

    /** Walks PARENT_CHILD relationships upward to find the top-most parent. */
    private Long findRootId(Long ticketId) {
        List<TicketRelationship> parentLinks = relationshipRepo
                .findBySourceTicketId(ticketId)
                .stream()
                .filter(r -> r.getRelationshipType() == RelationshipType.PARENT_CHILD)
                .collect(Collectors.toList());

        if (parentLinks.isEmpty()) return ticketId; // already at root
        return findRootId(parentLinks.get(0).getTargetTicketId());
    }

    /** Recursively builds a HierarchyNode for a ticket. */
    private HierarchyNode buildNode(Long ticketId, RelationshipType relationToParent) {
        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        HierarchyNode node = new HierarchyNode();
        node.setTicketId(ticket.getTicketId());
        node.setTicketNumber(ticket.getTicketNumber());
        node.setSubject(ticket.getSubject());
        node.setStatus(ticket.getStatus());
        node.setAssigneeName(ticket.getAssigneeName());
        node.setRelationToParent(relationToParent);

        // Find direct children (PARENT_CHILD where this ticket is the target=parent)
        List<TicketRelationship> childLinks = relationshipRepo
                .findByTargetTicketIdAndRelationshipType(ticketId, RelationshipType.PARENT_CHILD);

        List<HierarchyNode> children = childLinks.stream()
                .map(link -> buildNode(link.getSourceTicketId(), RelationshipType.PARENT_CHILD))
                .collect(Collectors.toList());

        node.setChildren(children);
        return node;
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private Ticket findOrThrow(Long id) {
        return ticketRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private TicketRelationship ensureRelationship(Long sourceId, Long targetId,
                                                   RelationshipType type,
                                                   Long createdBy, String notes) {
        if (relationshipRepo.existsBySourceTicketIdAndTargetTicketIdAndRelationshipType(
                sourceId, targetId, type)) {
            // Already exists — return existing row
            return relationshipRepo.findBySourceTicketId(sourceId).stream()
                    .filter(r -> r.getTargetTicketId().equals(targetId)
                              && r.getRelationshipType() == type)
                    .findFirst()
                    .orElseThrow();
        }
        TicketRelationship rel = new TicketRelationship();
        rel.setSourceTicketId(sourceId);
        rel.setTargetTicketId(targetId);
        rel.setRelationshipType(type);
        rel.setCreatedBy(createdBy);
        rel.setNotes(notes);
        return relationshipRepo.save(rel);
    }

    private void recordHistory(Ticket t, TicketStatus status, String remarks,
                                Long userId, String userName) {
        TicketHistory h = new TicketHistory();
        h.setTicketId(t.getTicketId());
        h.setStatus(status);
        h.setRemarks(remarks);
        h.setChangedBy(userId != null ? userId : 0L);
        h.setChangedByName(userName != null ? userName : "System");
        historyRepo.save(h);
    }

    public void retriggerDetection(Long ticketId) {
        Ticket ticket = findOrThrow(ticketId);
        runDuplicateDetection(ticket);
    }
	

    // ──────────────────────────────────────────────────────────────────────────
    // Import alias needed because this service returns TicketResponse (from dto)
    // ──────────────────────────────────────────────────────────────────────────
    // The import is resolved at the top of the file via wildcard imports in the
    // controller and service layers. Explicitly use the full path in the imports
    // block at the top of the real source file.
}
