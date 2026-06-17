// src/main/java/com/serviceeverz/userservice/sla/repository/SlaEvaluationRepository.java
package com.serviceeverz.userservice.sla.repository;
 
import com.serviceeverz.userservice.sla.entity.SlaEvaluation;
import com.serviceeverz.userservice.sla.enums.SlaStatus;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
 
import java.util.List;
import java.util.Optional;
 
@Repository
public interface SlaEvaluationRepository extends JpaRepository<SlaEvaluation, Long> {
 
    Optional<SlaEvaluation> findByTicketId(Long ticketId);
 
    List<SlaEvaluation> findBySlaStatus(SlaStatus status);
 
    List<SlaEvaluation> findByPriority(TicketPriority priority);
 
    long countBySlaStatus(SlaStatus status);
 
    /** Most recent breached tickets ordered by resolution deadline ASC (oldest breach first). */
    @Query("SELECT e FROM SlaEvaluation e WHERE e.slaStatus = 'BREACHED' ORDER BY e.resolutionDeadline ASC")
    List<SlaEvaluation> findRecentBreaches(Pageable pageable);
 
    /** At-risk tickets — within 20% of deadline, not yet breached. */
    @Query("SELECT e FROM SlaEvaluation e WHERE e.slaStatus = 'AT_RISK' ORDER BY e.resolutionDeadline ASC")
    List<SlaEvaluation> findAtRiskTickets(Pageable pageable);
 
    /** Breached count per priority. */
    @Query("SELECT e.priority, COUNT(e) FROM SlaEvaluation e WHERE e.slaStatus = 'BREACHED' GROUP BY e.priority")
    List<Object[]> countBreachByPriority();
}
 