package com.rvz.reportservice.repository;

import com.rvz.reportservice.entity.KnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long>,
        JpaSpecificationExecutor<KnowledgeBase> {

    List<KnowledgeBase> findByStatus(KnowledgeBase.KBStatus status);

    long countByStatus(KnowledgeBase.KBStatus status);

    @Query("SELECT kb.category AS category, COUNT(kb) AS count " +
           "FROM KnowledgeBase kb " +
           "GROUP BY kb.category " +
           "ORDER BY COUNT(kb) DESC")
    List<Map<String, Object>> countGroupByCategory();

    @Query("SELECT kb.authorName AS author, COUNT(kb) AS count " +
           "FROM KnowledgeBase kb " +
           "WHERE kb.authorName IS NOT NULL " +
           "GROUP BY kb.authorName " +
           "ORDER BY COUNT(kb) DESC")
    List<Map<String, Object>> articlesByAuthor();

    @Query("SELECT kb FROM KnowledgeBase kb " +
           "ORDER BY kb.viewCount DESC")
    List<KnowledgeBase> findTopViewedArticles(
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT SUM(kb.viewCount) FROM KnowledgeBase kb")
    Long totalViewCount();

    @Query("SELECT kb.status AS status, COUNT(kb) AS count " +
           "FROM KnowledgeBase kb " +
           "GROUP BY kb.status")
    List<Map<String, Object>> countGroupByStatus();
}
