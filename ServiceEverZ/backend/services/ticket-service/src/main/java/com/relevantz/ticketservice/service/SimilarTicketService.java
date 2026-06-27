package com.relevantz.ticketservice.service;

import com.relevantz.ticketservice.dto.SimilarTicketResponse;
import com.relevantz.ticketservice.model.Ticket;
import com.relevantz.ticketservice.model.TicketStatus;
import com.relevantz.ticketservice.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Finds open tickets that are similar to a candidate being created.
 *
 * Similarity is determined by:
 *   1. Metadata match  – same categoryId, subCategoryId, typeId, or itemId (40 pts max)
 *   2. Keyword match   – words from the title overlap with existing subjects (60 pts max)
 *
 * Tickets scoring >= THRESHOLD are returned, capped at MAX_RESULTS.
 * Only OPEN / IN_PROGRESS / REOPENED tickets are considered.
 * This service is read-only and never modifies any ticket.
 */
@Service
@Transactional(readOnly = true)
public class SimilarTicketService {

    private static final int THRESHOLD   = 30;  // minimum score to appear in results
    private static final int MAX_RESULTS = 5;

    // Stop-words filtered out before keyword matching
    private static final Set<String> STOP_WORDS = Set.of(
            "i", "me", "my", "a", "an", "the", "is", "it", "to", "in", "on",
            "for", "of", "and", "or", "not", "with", "this", "that", "can",
            "cannot", "need", "please", "help", "issue", "problem", "unable",
            "getting", "have", "has", "had", "was", "are", "do", "does", "did"
    );

    private final TicketRepository ticketRepository;

    public SimilarTicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    /**
     * Returns similar open tickets for the given candidate parameters.
     *
     * @param title        Subject / title the user is currently typing
     * @param categoryId   Category selected in the form (nullable)
     * @param subCategoryId Sub-category selected in the form (nullable)
     * @param typeId        Type selected in the form (nullable)
     * @param itemId        Item selected in the form (nullable)
     */
    public List<SimilarTicketResponse> findSimilar(
            String title,
            Long categoryId,
            Long subCategoryId,
            Long typeId,
            Long itemId) {

        if (title == null || title.isBlank()) {
            return Collections.emptyList();
        }

        // Only search active tickets
        List<TicketStatus> activeStatuses = List.of(
                TicketStatus.OPEN,
                TicketStatus.IN_PROGRESS,
                TicketStatus.REOPENED
        );

        List<Ticket> candidates = ticketRepository.findByStatusIn(activeStatuses);

        Set<String> titleKeywords = extractKeywords(title);
        if (titleKeywords.isEmpty()) {
            return Collections.emptyList();
        }

        List<SimilarTicketResponse> results = new ArrayList<>();

        for (Ticket t : candidates) {
            int score = computeScore(t, titleKeywords, categoryId, subCategoryId, typeId, itemId);
            if (score >= THRESHOLD) {
                results.add(toResponse(t, score));
            }
        }

        // Sort by score descending, return top N
        return results.stream()
                .sorted(Comparator.comparingInt(SimilarTicketResponse::getMatchScore).reversed())
                .limit(MAX_RESULTS)
                .collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Computes a similarity score 0–100 between a candidate and an existing ticket.
     * Metadata match gives up to 40 pts; keyword match gives up to 60 pts.
     */
    private int computeScore(Ticket existing, Set<String> titleKeywords,
                              Long categoryId, Long subCategoryId,
                              Long typeId, Long itemId) {
        int metaScore = 0;

        // Category (15 pts)
        if (categoryId != null && categoryId.equals(existing.getCategoryId())) {
            metaScore += 15;
        }
        // SubCategory (15 pts)
        if (subCategoryId != null && subCategoryId.equals(existing.getSubCategoryId())) {
            metaScore += 15;
        }
        // Type (5 pts)
        if (typeId != null && typeId.equals(existing.getTypeId())) {
            metaScore += 5;
        }
        // Item (5 pts)
        if (itemId != null && itemId.equals(existing.getItemId())) {
            metaScore += 5;
        }

        // Keyword overlap on subject
        Set<String> existingKeywords = extractKeywords(existing.getSubject());
        int keywordScore = 0;
        if (!existingKeywords.isEmpty()) {
            long matchCount = titleKeywords.stream().filter(existingKeywords::contains).count();
            keywordScore = (int) Math.round((double) matchCount / titleKeywords.size() * 60);
        }

        return Math.min(100, metaScore + keywordScore);
    }

    /**
     * Splits text into lowercase words, removes stop-words and short tokens.
     */
    private Set<String> extractKeywords(String text) {
        if (text == null || text.isBlank()) return Collections.emptySet();

        // Strip HTML tags (description may contain them)
        String plain = text.replaceAll("<[^>]+>", " ").toLowerCase();

        return Arrays.stream(plain.split("[^a-z0-9]+"))
                .filter(w -> w.length() >= 3)
                .filter(w -> !STOP_WORDS.contains(w))
                .collect(Collectors.toSet());
    }

    private SimilarTicketResponse toResponse(Ticket t, int score) {
        return new SimilarTicketResponse(
                t.getTicketId(),
                t.getTicketNumber(),
                t.getSubject(),
                t.getStatus() != null ? t.getStatus().name() : "OPEN",
                t.getCategoryName(),
                t.getSubCategoryName(),
                t.getItemName(),
                score
        );
    }
}
