package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long>,
        JpaSpecificationExecutor<Feedback> {

    Optional<Feedback> findByTicketId(Long ticketId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.rating IS NOT NULL")
    Double averageRating();

    @Query("SELECT AVG(f.rating) FROM Feedback f " +
           "WHERE f.rating IS NOT NULL AND f.submittedAt BETWEEN :from AND :to")
    Double averageRatingBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT f.rating AS rating, COUNT(f) AS count " +
           "FROM Feedback f " +
           "GROUP BY f.rating " +
           "ORDER BY f.rating")
    List<Map<String, Object>> countGroupByRating();

    @Query("SELECT f.resolvedByName AS agent, AVG(f.rating) AS avgScore, COUNT(f) AS totalFeedback " +
           "FROM Feedback f " +
           "WHERE f.resolvedByName IS NOT NULL AND f.rating IS NOT NULL " +
           "GROUP BY f.resolvedByName " +
           "ORDER BY AVG(f.rating) DESC")
    List<Map<String, Object>> csatByAgent();

    @Query("SELECT f.categoryName AS category, AVG(f.rating) AS avgScore, COUNT(f) AS total " +
           "FROM Feedback f " +
           "WHERE f.categoryName IS NOT NULL AND f.rating IS NOT NULL " +
           "GROUP BY f.categoryName " +
           "ORDER BY AVG(f.rating) DESC")
    List<Map<String, Object>> csatByCategory();

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.rating >= 4")
    long countPositiveFeedback();

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.rating <= 2")
    long countNegativeFeedback();

    @Query(value = "SELECT DATE(submitted_at) AS date, AVG(rating) AS avgScore, COUNT(*) AS count " +
                   "FROM csat_survey " +
                   "WHERE submitted_at BETWEEN :from AND :to " +
                   "GROUP BY DATE(submitted_at) " +
                   "ORDER BY DATE(submitted_at)",
           nativeQuery = true)
    List<Map<String, Object>> dailyCsatTrend(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
