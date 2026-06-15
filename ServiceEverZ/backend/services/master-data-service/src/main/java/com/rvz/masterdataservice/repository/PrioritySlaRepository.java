package com.rvz.masterdataservice.repository;

import com.rvz.masterdataservice.entity.PrioritySla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrioritySlaRepository extends JpaRepository<PrioritySla, Integer> {
}
