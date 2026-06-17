package com.rvz.serviceeverz.service;

import java.util.List;

import com.rvz.serviceeverz.dto.request.CreateProblemRequest;
import com.rvz.serviceeverz.dto.request.LinkIncidentRequest;
import com.rvz.serviceeverz.dto.request.PermanentFixRequest;
import com.rvz.serviceeverz.dto.request.RcaRequest;
import com.rvz.serviceeverz.dto.request.WorkaroundRequest;
import com.rvz.serviceeverz.dto.response.KnownErrorRecordResponse;
import com.rvz.serviceeverz.dto.response.ProblemResponse;
import com.rvz.serviceeverz.enums.ProblemPriority;
import com.rvz.serviceeverz.enums.ProblemStatus;

public interface ProblemService {
	ProblemResponse createProblem(CreateProblemRequest request);

	ProblemResponse linkIncident(Long problemId, LinkIncidentRequest request);

	ProblemResponse submitRca(Long problemId, RcaRequest request);

	ProblemResponse provideWorkaround(Long problemId, WorkaroundRequest request);

	ProblemResponse applyPermanentFix(Long problemId, PermanentFixRequest request);

	ProblemResponse closeProblem(Long problemId, Long closedBySpId);

	ProblemResponse getProblemById(Long id);

	ProblemResponse getProblemByNumber(String problemNumber);

	List<ProblemResponse> getAllProblems();

	List<ProblemResponse> getProblemsByStatus(ProblemStatus status);

	List<ProblemResponse> getProblemsByPriority(ProblemPriority priority);

	List<ProblemResponse> getProblemsBySp(Long spId);

	List<ProblemResponse> getProblemsByManager(Long managerId);

	List<ProblemResponse> searchProblems(String keyword);

	KnownErrorRecordResponse getKerByProblemId(Long problemId);

	List<KnownErrorRecordResponse> getAllKerRecords();

	List<KnownErrorRecordResponse> searchKedb(String keyword);
}
