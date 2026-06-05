package com.rvz.serviceeverz.knowledgebase.repository;
 
import com.rvz.serviceeverz.knowledgebase.entity.KbArticleVersion;
import com.rvz.serviceeverz.knowledgebase.enums.VersionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;
 
public interface KbArticleVersionRepository extends JpaRepository<KbArticleVersion, Long> {
    List<KbArticleVersion> findByArticleIdOrderByVersionNumberDesc(Long articleId);
    Optional<KbArticleVersion> findByArticleIdAndIsActiveVersionTrue(Long articleId);
    Optional<KbArticleVersion> findByArticleIdAndState(Long articleId, VersionStatus state);
    boolean existsByArticleIdAndState(Long articleId, VersionStatus state);
 
    @Query("SELECT MAX(v.versionNumber) FROM KbArticleVersion v WHERE v.article.id = :articleId")
    Integer findMaxVersionNumberByArticleId(@Param("articleId") Long articleId);
}
 