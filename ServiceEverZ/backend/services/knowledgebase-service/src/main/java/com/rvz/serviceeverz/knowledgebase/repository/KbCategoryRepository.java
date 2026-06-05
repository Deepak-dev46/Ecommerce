package com.rvz.serviceeverz.knowledgebase.repository;
 
import com.rvz.serviceeverz.knowledgebase.entity.KbCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
 
public interface KbCategoryRepository extends JpaRepository<KbCategory, Long> {
    List<KbCategory> findByIsActiveTrue();
    Optional<KbCategory> findByNameIgnoreCase(String name);
 
    // NEW: Search categories by partial name match (for typeahead suggestions)
    List<KbCategory> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}
 