// package com.rvz.approvalservice.repository;
// import com.rvz.approvalservice.entity.TicketApproval;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import org.springframework.stereotype.Repository;
// import java.util.List;
// import java.util.Optional;
// @Repository
// public interface TicketApprovalRepository extends JpaRepository<TicketApproval, Long> {
//     Optional<TicketApproval> findByTicketId(Long ticketId);
//     // FIX 2: Filter by l1ApproverId so only that L1 person's tickets appear
//     @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'PENDING' AND t.l1ApproverId = :approverId")
//     List<TicketApproval> findPendingL1ByApproverId(@Param("approverId") String approverId);
//     // FIX 2: Filter by l2ApproverId so only that L2 person's tickets appear
//     @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'APPROVED' AND t.l2Status = 'PENDING' AND t.l2ApproverId = :approverId")
//     List<TicketApproval> findPendingL2ByApproverId(@Param("approverId") String approverId);
//     // Fallback (no filter) — used by ITSM managers to see all
//     @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'PENDING'")
//     List<TicketApproval> findAllPendingL1();
//     @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'APPROVED' AND t.l2Status = 'PENDING'")
//     List<TicketApproval> findAllPendingL2();
//     // FIX 3: History — tickets that have already been processed by this L1
//     @Query("SELECT t FROM TicketApproval t WHERE t.l1ApproverId = :approverId AND t.l1Status <> 'PENDING'")
//     List<TicketApproval> findL1HistoryByApproverId(@Param("approverId") String approverId);
//     // FIX 3: History — tickets that have already been processed by this L2
//     @Query("SELECT t FROM TicketApproval t WHERE t.l2ApproverId = :approverId AND t.l2Status <> 'PENDING' AND t.l2Status <> 'L1_REJECTED'")
//     List<TicketApproval> findL2HistoryByApproverId(@Param("approverId") String approverId);
//     // Resource owner queries
//     @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'APPROVED' " +
//             "AND t.l2Status = 'APPROVED' " +
//             "AND t.requiresResourceApproval = true " +
//             "AND t.resourceOwnerStatus = 'PENDING' " +
//             "AND t.resourceOwnerId = :approverId")
//     List<TicketApproval> findPendingResourceOwnerByApproverId(@Param("approverId") String approverId);
//     @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'APPROVED' " +
//             "AND t.l2Status = 'APPROVED' " +
//             "AND t.requiresResourceApproval = true " +
//             "AND t.resourceOwnerStatus = 'PENDING'")
//     List<TicketApproval> findAllPendingResourceOwner();
// }
package com.rvz.approvalservice.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rvz.approvalservice.entity.TicketApproval;

@Repository
public interface TicketApprovalRepository extends JpaRepository<TicketApproval, Long> {

    Optional<TicketApproval> findByTicketId(Long ticketId);

    // ── L1 queries ───────────────────────────────────────────────────────────
    @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'PENDING' AND t.l1ApproverId = :approverId")
    List<TicketApproval> findPendingL1ByApproverId(@Param("approverId") String approverId);

    @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'PENDING'")
    List<TicketApproval> findAllPendingL1();

    @Query("SELECT t FROM TicketApproval t WHERE t.l1ApproverId = :approverId AND t.l1Status <> 'PENDING'")
    List<TicketApproval> findL1HistoryByApproverId(@Param("approverId") String approverId);

    // ── L2 queries ───────────────────────────────────────────────────────────
    @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'APPROVED' AND t.l2Status = 'PENDING' AND t.l2ApproverId = :approverId")
    List<TicketApproval> findPendingL2ByApproverId(@Param("approverId") String approverId);

    @Query("SELECT t FROM TicketApproval t WHERE t.l1Status = 'APPROVED' AND t.l2Status = 'PENDING'")
    List<TicketApproval> findAllPendingL2();

    @Query("SELECT t FROM TicketApproval t WHERE t.l2ApproverId = :approverId AND t.l2Status <> 'PENDING' AND t.l2Status <> 'L1_REJECTED'")
    List<TicketApproval> findL2HistoryByApproverId(@Param("approverId") String approverId);

    // ── UNIFIED: tickets where user is L1 OR L2 approver (pending) ───────────
    // Used by the combined Approval Queue — shows all tickets this person needs to action
    @Query("""
        SELECT t FROM TicketApproval t WHERE
            (t.l1ApproverId = :approverId AND t.l1Status = 'PENDING')
            OR
            (t.l2ApproverId = :approverId AND t.l1Status = 'APPROVED' AND t.l2Status = 'PENDING')
        """)
    List<TicketApproval> findAllPendingForApprover(@Param("approverId") String approverId);

    @Query("""
        SELECT t FROM TicketApproval t WHERE
            t.l1Status = 'APPROVED'
            AND t.l2Status = 'APPROVED'
            AND (
                t.requiresResourceApproval = false
                OR t.requiresResourceApproval IS NULL
                OR (t.requiresResourceApproval = true AND t.resourceOwnerStatus = 'APPROVED')
            )
        """)
    List<TicketApproval> findAllFullyApproved();

    // ── UNIFIED: combined history for this user (as L1 or L2) ────────────────
    @Query("""
        SELECT t FROM TicketApproval t WHERE
            (t.l1ApproverId = :approverId AND t.l1Status <> 'PENDING')
            OR
            (t.l2ApproverId = :approverId AND t.l2Status <> 'PENDING' AND t.l2Status <> 'L1_REJECTED')
        """)
    List<TicketApproval> findAllHistoryForApprover(@Param("approverId") String approverId);

    // ── Resource Owner queries ────────────────────────────────────────────────
    @Query("""
        SELECT t FROM TicketApproval t WHERE
            t.l1Status = 'APPROVED'
            AND t.l2Status = 'APPROVED'
            AND t.requiresResourceApproval = true
            AND t.resourceOwnerStatus = 'PENDING'
            AND t.resourceOwnerId = :approverId
        """)
    List<TicketApproval> findPendingResourceOwnerByApproverId(@Param("approverId") String approverId);

    @Query("""
        SELECT t FROM TicketApproval t WHERE
            t.l1Status = 'APPROVED'
            AND t.l2Status = 'APPROVED'
            AND t.requiresResourceApproval = true
            AND t.resourceOwnerStatus = 'PENDING'
        """)
    List<TicketApproval> findAllPendingResourceOwner();
    
    @Query("""
    	    SELECT t FROM TicketApproval t WHERE
    	        t.updatedAt < :threshold
    	        AND (
    	            t.l1Status = 'PENDING'
    	            OR (t.l1Status = 'APPROVED' AND t.l2Status = 'PENDING')
    	            OR (t.l1Status = 'APPROVED' AND t.l2Status = 'APPROVED'
    	                AND t.requiresResourceApproval = true
    	                AND t.resourceOwnerStatus = 'PENDING')
    	        )
    	    """)
    	List<TicketApproval> findStillPendingBefore(@Param("threshold") LocalDateTime threshold);
}
