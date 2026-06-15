package com.relevantz.ticketservice.repository;
 
import java.util.List;
 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
 
import com.relevantz.ticketservice.model.Ticket;
import com.relevantz.ticketservice.model.TicketStatus;
 
public interface TicketRepository extends JpaRepository<Ticket, Long> {
 
    // ✅ End User: get tickets by USER ID (FIXED)
    @Query("SELECT t FROM Ticket t WHERE t.userId = :userId ORDER BY t.updatedAt DESC")
    List<Ticket> findByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId);
 
    // ✅ Support: assigned tickets (CORRECT ✅)
    @Query("SELECT t FROM Ticket t WHERE t.assigneeId = :assigneeId ORDER BY t.updatedAt DESC")
    List<Ticket> findByAssigneeIdOrderByUpdatedAtDesc(@Param("assigneeId") Long assigneeId);
 
    List<Ticket> findByUserIdAndDraftTrueOrderByUpdatedAtDesc(@Param("userId") Long userId);
 
    List<Ticket> findByUserIdAndDraftTrue(Long userId);
    // ✅ Count by status (CORRECT ✅)
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status")
    long countByStatus(@Param("status") TicketStatus status);
   
    @Query("SELECT t.assigneeName FROM Ticket t WHERE t.ticketId = ?1")
    String getAssigneeName(long id);
}
 