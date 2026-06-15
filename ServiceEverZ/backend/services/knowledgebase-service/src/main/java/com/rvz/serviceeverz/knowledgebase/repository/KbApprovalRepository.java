package com.rvz.serviceeverz.knowledgebase.repository;
 
import com.rvz.serviceeverz.knowledgebase.entity.KbApproval;
import com.rvz.serviceeverz.knowledgebase.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
 
public interface KbApprovalRepository extends JpaRepository<KbApproval, Long> {
    List<KbApproval> findByArticleVersionId(Long versionId);
    Optional<KbApproval> findByArticleVersionIdAndStatus(Long versionId, ApprovalStatus status);
}
 