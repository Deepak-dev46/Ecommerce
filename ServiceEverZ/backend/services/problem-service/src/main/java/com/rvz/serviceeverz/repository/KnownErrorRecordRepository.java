package com.rvz.serviceeverz.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rvz.serviceeverz.entity.KnownErrorRecord;

public interface KnownErrorRecordRepository extends JpaRepository<KnownErrorRecord, Long> {
	Optional<KnownErrorRecord> findByProblemId(Long problemId);

	List<KnownErrorRecord> findAllByIsActiveTrue();

	List<KnownErrorRecord> findAllByOrderByCreatedAtDesc();

	@Query("SELECT k FROM KnownErrorRecord k WHERE " + "LOWER(k.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
			+ "LOWER(k.symptoms) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
			+ "LOWER(k.rootCause) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
			+ "LOWER(k.affectedCi) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	List<KnownErrorRecord> searchKedb(@Param("keyword") String keyword);
}
