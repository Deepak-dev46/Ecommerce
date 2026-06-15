package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>,
        JpaSpecificationExecutor<Ticket> {

    // ── Volume queries ────────────────────────────────────────────────────────

    long countByStatus(Ticket.TicketStatus status);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    // Global (all records) — used when no date filter is provided
    @Query("SELECT t.status AS status, COUNT(t) AS count " +
           "FROM Ticket t " +
           "GROUP BY t.status")
    List<Map<String, Object>> countGroupByStatus();

    // FIX: Date-filtered version — used when startDate/endDate are present
    @Query("SELECT t.status AS status, COUNT(t) AS count " +
           "FROM Ticket t " +
           "WHERE t.createdAt BETWEEN :from AND :to " +
           "GROUP BY t.status")
    List<Map<String, Object>> countGroupByStatusBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Global
    @Query("SELECT t.priority AS priority, COUNT(t) AS count " +
           "FROM Ticket t " +
           "GROUP BY t.priority")
    List<Map<String, Object>> countGroupByPriority();

    // FIX: Date-filtered version
    @Query("SELECT t.priority AS priority, COUNT(t) AS count " +
           "FROM Ticket t " +
           "WHERE t.createdAt BETWEEN :from AND :to " +
           "GROUP BY t.priority")
    List<Map<String, Object>> countGroupByPriorityBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Global
    @Query("SELECT t.categoryName AS category, COUNT(t) AS count " +
           "FROM Ticket t " +
           "GROUP BY t.categoryName " +
           "ORDER BY COUNT(t) DESC")
    List<Map<String, Object>> countGroupByCategory();

    // FIX: Date-filtered version
    @Query("SELECT t.categoryName AS category, COUNT(t) AS count " +
           "FROM Ticket t " +
           "WHERE t.createdAt BETWEEN :from AND :to " +
           "GROUP BY t.categoryName " +
           "ORDER BY COUNT(t) DESC")
    List<Map<String, Object>> countGroupByCategoryBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // ── Assignment queries ────────────────────────────────────────────────────

    @Query("SELECT t.assigneeName AS assignee, COUNT(t) AS count " +
           "FROM Ticket t " +
           "WHERE t.assigneeName IS NOT NULL " +
           "GROUP BY t.assigneeName " +
           "ORDER BY COUNT(t) DESC")
    List<Map<String, Object>> countGroupByAssignee();

    @Query("SELECT t.assigneeName AS assignee, COUNT(t) AS count " +
           "FROM Ticket t " +
           "WHERE t.assigneeName IS NOT NULL " +
           "AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY t.assigneeName " +
           "ORDER BY COUNT(t) DESC")
    List<Map<String, Object>> countGroupByAssigneeBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // ── Reopened tickets ──────────────────────────────────────────────────────

    @Query("SELECT t FROM Ticket t WHERE t.status = 'REOPENED' OR t.reopenedCount > 0")
    List<Ticket> findReopenedTickets();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = 'REOPENED' OR t.reopenedCount > 0")
    long countReopenedTickets();

    @Query("SELECT t FROM Ticket t WHERE (t.status = 'REOPENED' OR t.reopenedCount > 0) " +
           "AND t.createdAt BETWEEN :from AND :to")
    List<Ticket> findReopenedTicketsBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // ── Trend (daily volume) ──────────────────────────────────────────────────

    @Query(value = "SELECT DATE(created_at) AS date, COUNT(*) AS count " +
                   "FROM ticket " +
                   "WHERE created_at BETWEEN :from AND :to " +
                   "GROUP BY DATE(created_at) " +
                   "ORDER BY DATE(created_at)",
           nativeQuery = true)
    List<Map<String, Object>> dailyTicketVolume(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // ── Unassigned ────────────────────────────────────────────────────────────

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assigneeId IS NULL AND t.status NOT IN ('CLOSED','CANCELLED')")
    long countUnassignedOpenTickets();
}
