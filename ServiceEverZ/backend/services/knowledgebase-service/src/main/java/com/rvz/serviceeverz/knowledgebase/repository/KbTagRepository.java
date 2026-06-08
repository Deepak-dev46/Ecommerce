package com.rvz.serviceeverz.knowledgebase.repository;
 
import com.rvz.serviceeverz.knowledgebase.entity.KbTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
 
public interface KbTagRepository extends JpaRepository<KbTag, Long> {
    Optional<KbTag> findByNameIgnoreCase(String name);
}
 