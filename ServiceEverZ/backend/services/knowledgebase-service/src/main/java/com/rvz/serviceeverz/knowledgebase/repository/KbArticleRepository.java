package com.rvz.serviceeverz.knowledgebase.repository;

import com.rvz.serviceeverz.knowledgebase.entity.KbArticle;
import com.rvz.serviceeverz.knowledgebase.enums.ArticleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface KbArticleRepository extends JpaRepository<KbArticle, Long> {
	List<KbArticle> findByIsDeletedFalse();

	List<KbArticle> findByStatusAndIsDeletedFalse(ArticleStatus status);

	List<KbArticle> findByCreatedByAndIsDeletedFalse(Long createdBy);

	Optional<KbArticle> findByKbNumberAndIsDeletedFalse(String kbNumber);

	@Query("SELECT a FROM KbArticle a WHERE a.status = 'PUBLISHED' AND a.isDeleted = false "
			+ "AND LOWER(a.title) LIKE LOWER(CONCAT('%', :kw, '%'))")
	List<KbArticle> searchPublishedByTitle(@Param("kw") String kw);

	@Query("SELECT DISTINCT a FROM KbArticle a JOIN a.tags t WHERE a.status = 'PUBLISHED' "
			+ "AND a.isDeleted = false AND LOWER(t.name) LIKE LOWER(CONCAT('%', :kw, '%'))")
	List<KbArticle> searchPublishedByTag(@Param("kw") String kw);
}
