package com.rvz.serviceeverz.knowledgebase.repository;
 
import com.rvz.serviceeverz.knowledgebase.entity.KbFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
 
public interface KbFeedbackRepository extends JpaRepository<KbFeedback, Long> {
    List<KbFeedback> findByArticleId(Long articleId);
    boolean existsByArticleIdAndUserId(Long articleId, Long userId);
 
    @Query("SELECT AVG(f.rating) FROM KbFeedback f WHERE f.article.id = :id")
    Double findAverageRatingByArticleId(@Param("id") Long id);
 
    @Query("SELECT COUNT(f) FROM KbFeedback f WHERE f.article.id = :id")
    Long countByArticleId(@Param("id") Long id);
}
 