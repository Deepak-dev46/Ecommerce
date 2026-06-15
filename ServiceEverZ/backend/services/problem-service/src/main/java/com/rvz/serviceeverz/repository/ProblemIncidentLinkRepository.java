package com.rvz.serviceeverz.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rvz.serviceeverz.entity.ProblemIncidentLink;

public interface ProblemIncidentLinkRepository extends JpaRepository<ProblemIncidentLink, Long> {
	List<ProblemIncidentLink> findAllByProblemId(Long problemId);

	boolean existsByProblemIdAndIncidentId(Long problemId, Long incidentId);

	List<ProblemIncidentLink> findAllByIncidentId(Long incidentId);
}
