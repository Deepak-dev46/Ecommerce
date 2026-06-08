package com.relevantz.ticketservice.repository;

import com.relevantz.ticketservice.model.DuplicateScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
// Added by Team -A
public interface DuplicateScoreRepository extends JpaRepository<DuplicateScore, Long> {

    /**
     * All auto-flagged pairs that haven't been reviewed yet.
     * Shown in the support agent's "Potential Duplicates" panel.
     */
    @Query("SELECT d FROM DuplicateScore d " +
           "WHERE d.autoFlagged = true AND d.mergeConfirmed = false AND d.dismissed = false " +
           "ORDER BY d.score DESC")
    List<DuplicateScore> findPendingReview();

@Query("""
SELECT COUNT(d) > 0
FROM DuplicateScore d
WHERE
(d.originalTicketId = :ticketA AND d.duplicateTicketId = :ticketB)
OR
(d.originalTicketId = :ticketB AND d.duplicateTicketId = :ticketA)
""")
boolean existsPair(
        @Param("ticketA") Long ticketA,
        @Param("ticketB") Long ticketB
);
 
    /**
     * All duplicate candidates involving the given original ticket.
     */
    List<DuplicateScore> findByOriginalTicketIdAndDismissedFalse(Long originalTicketId);

    /**
     * All duplicate candidates involving the given duplicate ticket.
     */
    List<DuplicateScore> findByDuplicateTicketIdAndDismissedFalse(Long duplicateTicketId);

    /**
     * Check if a pair already has a score record (avoid re-scoring on every update).
     */
    boolean existsByOriginalTicketIdAndDuplicateTicketId(Long originalTicketId, Long duplicateTicketId);
}
