package com.rvz.masterdataservice.repository;

import com.rvz.masterdataservice.entity.ComplexityEffort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplexityEffortRepository extends JpaRepository<ComplexityEffort, Integer> {
}
