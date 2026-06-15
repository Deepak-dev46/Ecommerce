package com.rvz.actionservice.autoclose.repository;

import com.rvz.actionservice.autoclose.entity.AutoCloseConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AutoCloseConfigRepository extends JpaRepository<AutoCloseConfig, Long> {

    /**
     * Returns the best matching config for a ticket:
     *   1st priority: SLA-specific config (slaId matches)
     *   2nd priority: Global config (slaId IS NULL)
     * ORDER BY slaId DESC NULLS LAST puts the specific match first.
     */
    @Query("SELECT c FROM AutoCloseConfig c " +
           "WHERE c.enabled = true AND (c.slaId = :slaId OR c.slaId IS NULL) " +
           "ORDER BY c.slaId DESC NULLS LAST")
    Optional<AutoCloseConfig> findEffectiveConfig(@Param("slaId") Long slaId);

    /** Find the global config (slaId IS NULL). */
    Optional<AutoCloseConfig> findBySlaIdIsNull();

    /** Find an SLA-specific config. */
    Optional<AutoCloseConfig> findBySlaId(Long slaId);
}
