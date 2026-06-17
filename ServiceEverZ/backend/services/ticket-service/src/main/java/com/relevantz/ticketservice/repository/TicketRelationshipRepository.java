package com.relevantz.ticketservice.repository;

import com.relevantz.ticketservice.model.RelationshipType;
import com.relevantz.ticketservice.model.TicketRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
//Added by team - A

public interface TicketRelationshipRepository extends JpaRepository<TicketRelationship, Long> {

    /** All relationships where this ticket is the source (child / linked from). */
    List<TicketRelationship> findBySourceTicketId(Long sourceTicketId);

    /** All relationships where this ticket is the target (parent / linked to). */
    List<TicketRelationship> findByTargetTicketId(Long targetTicketId);

    /**
     * All relationships involving a ticket (either as source or target).
     * Used for the hierarchy view and link panel.
     */
    @Query("SELECT r FROM TicketRelationship r " +
           "WHERE r.sourceTicketId = :ticketId OR r.targetTicketId = :ticketId")
    List<TicketRelationship> findAllInvolving(@Param("ticketId") Long ticketId);

    /** Children of a parent ticket (created during Split, Feature 2). */
    List<TicketRelationship> findByTargetTicketIdAndRelationshipType(
            Long targetTicketId, RelationshipType type);

    /** Check whether a specific pair already exists. */
    boolean existsBySourceTicketIdAndTargetTicketIdAndRelationshipType(
            Long sourceTicketId, Long targetTicketId, RelationshipType type);
            List<TicketRelationship> findBySourceTicketIdAndRelationshipType(
        Long sourceTicketId, RelationshipType type);
     
}
