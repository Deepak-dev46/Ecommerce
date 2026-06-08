package com.rvz.serviceeverz.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rvz.serviceeverz.entity.ProblemCategory;

public interface ProblemCategoryRepository extends JpaRepository<ProblemCategory, Long> {
	Optional<ProblemCategory> findByNameIgnoreCase(String name);

	List<ProblemCategory> findAllByIsActiveTrue();

	boolean existsByNameIgnoreCase(String name);
}
