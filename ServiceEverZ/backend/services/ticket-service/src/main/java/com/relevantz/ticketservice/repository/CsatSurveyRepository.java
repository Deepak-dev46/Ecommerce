package com.relevantz.ticketservice.repository;

import com.relevantz.ticketservice.model.CsatSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CsatSurveyRepository extends JpaRepository<CsatSurvey, Long> {

    /** Find survey for a specific ticket — used for duplicate prevention */
    Optional<CsatSurvey> findByTicketId(Long ticketId);

    /** All completed (submitted) surveys for dashboard */
    List<CsatSurvey> findByRatingIsNotNull();

    /** Agent-wise filter */
    List<CsatSurvey> findByResolvedByIdAndRatingIsNotNull(Long resolvedById);

    /** Category-wise filter */
    List<CsatSurvey> findByCategoryNameAndRatingIsNotNull(String categoryName);

    /** Date-range filter for dashboard reports */
    @Query("SELECT c FROM CsatSurvey c WHERE c.rating IS NOT NULL " +
           "AND c.submittedAt BETWEEN :from AND :to")
    List<CsatSurvey> findByDateRange(@Param("from") LocalDateTime from,
                                     @Param("to") LocalDateTime to);

    /** Overall average CSAT score */
    @Query("SELECT AVG(c.rating) FROM CsatSurvey c WHERE c.rating IS NOT NULL")
    Double findOverallAverageRating();
}
