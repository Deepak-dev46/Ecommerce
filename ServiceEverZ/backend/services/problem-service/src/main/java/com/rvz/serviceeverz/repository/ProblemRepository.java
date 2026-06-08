package com.rvz.serviceeverz.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rvz.serviceeverz.entity.Problem;
import com.rvz.serviceeverz.enums.ProblemPriority;
import com.rvz.serviceeverz.enums.ProblemStatus;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
	
	Optional<Problem> findByProblemNumber(String problemNumber);

	List<Problem> findAllByOrderByCreatedAtDesc();

	List<Problem> findAllByStatus(ProblemStatus status);

	List<Problem> findAllByPriority(ProblemPriority priority);

	List<Problem> findAllByCreatedBySpId(Long spId);

	List<Problem> findAllByManagerId(Long managerId);

	long countByStatus(ProblemStatus status);

	@Query("SELECT p FROM Problem p WHERE " + "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
			+ "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
			+ "LOWER(p.ciName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	List<Problem> searchByKeyword(@Param("keyword") String keyword);
}
