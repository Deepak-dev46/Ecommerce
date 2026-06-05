package com.rvz.serviceeverz.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rvz.serviceeverz.dto.request.CreateProblemRequest;
import com.rvz.serviceeverz.dto.request.LinkIncidentRequest;
import com.rvz.serviceeverz.dto.request.PermanentFixRequest;
import com.rvz.serviceeverz.dto.request.RcaRequest;
import com.rvz.serviceeverz.dto.request.WorkaroundRequest;
import com.rvz.serviceeverz.dto.response.ApiResponse;
import com.rvz.serviceeverz.dto.response.KnownErrorRecordResponse;
import com.rvz.serviceeverz.dto.response.ProblemResponse;
import com.rvz.serviceeverz.enums.ProblemPriority;
import com.rvz.serviceeverz.enums.ProblemStatus;
import com.rvz.serviceeverz.service.ProblemService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin
public class ProblemController {

	private final ProblemService service;

	public ProblemController(ProblemService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<ProblemResponse>> create(@Valid @RequestBody CreateProblemRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(true, "Problem created", service.createProblem(request)));
	}

	@PostMapping("/{id}/link-incident")
	public ResponseEntity<ApiResponse<ProblemResponse>> linkIncident(@PathVariable Long id,
			@Valid @RequestBody LinkIncidentRequest request) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Incident linked", service.linkIncident(id, request)));
	}

	@PutMapping("/{id}/rca")
	public ResponseEntity<ApiResponse<ProblemResponse>> submitRca(@PathVariable Long id,
			@Valid @RequestBody RcaRequest request) {
		return ResponseEntity.ok(new ApiResponse<>(true, "RCA submitted", service.submitRca(id, request)));
	}

	@PutMapping("/{id}/workaround")
	public ResponseEntity<ApiResponse<ProblemResponse>> provideWorkaround(@PathVariable Long id,
			@Valid @RequestBody WorkaroundRequest request) {
		return ResponseEntity
				.ok(new ApiResponse<>(true, "Workaround provided", service.provideWorkaround(id, request)));
	}

	@PutMapping("/{id}/permanent-fix")
	public ResponseEntity<ApiResponse<ProblemResponse>> applyPermanentFix(@PathVariable Long id,
			@Valid @RequestBody PermanentFixRequest request) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Permanent fix applied + KEDB updated",
				service.applyPermanentFix(id, request)));
	}

	@PutMapping("/{id}/close")
	public ResponseEntity<ApiResponse<ProblemResponse>> closeProblem(@PathVariable Long id,
			@RequestParam Long closedBySpId) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Problem closed", service.closeProblem(id, closedBySpId)));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ProblemResponse>> getById(@PathVariable Long id) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Problem fetched", service.getProblemById(id)));
	}

	@GetMapping("/number/{problemNumber}")
	public ResponseEntity<ApiResponse<ProblemResponse>> getByNumber(@PathVariable String problemNumber) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Problem fetched", service.getProblemByNumber(problemNumber)));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<ProblemResponse>>> getAll() {
		return ResponseEntity.ok(new ApiResponse<>(true, "All problems", service.getAllProblems()));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<ProblemResponse>>> byStatus(@PathVariable ProblemStatus status) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Problems by status", service.getProblemsByStatus(status)));
	}

	@GetMapping("/priority/{priority}")
	public ResponseEntity<ApiResponse<List<ProblemResponse>>> byPriority(@PathVariable ProblemPriority priority) {
		return ResponseEntity
				.ok(new ApiResponse<>(true, "Problems by priority", service.getProblemsByPriority(priority)));
	}

	@GetMapping("/sp/{spId}")
	public ResponseEntity<ApiResponse<List<ProblemResponse>>> bySp(@PathVariable Long spId) {
		return ResponseEntity.ok(new ApiResponse<>(true, "SP problems", service.getProblemsBySp(spId)));
	}

	@GetMapping("/manager/{managerId}")
	public ResponseEntity<ApiResponse<List<ProblemResponse>>> byManager(@PathVariable Long managerId) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Manager problems", service.getProblemsByManager(managerId)));
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponse<List<ProblemResponse>>> search(@RequestParam(required = false) String keyword) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Search results", service.searchProblems(keyword)));
	}

	@GetMapping("/{id}/kedb")
	public ResponseEntity<ApiResponse<KnownErrorRecordResponse>> getKer(@PathVariable Long id) {
		return ResponseEntity.ok(new ApiResponse<>(true, "KEDB record", service.getKerByProblemId(id)));
	}

	@GetMapping("/kedb")
	public ResponseEntity<ApiResponse<List<KnownErrorRecordResponse>>> getAllKer() {
		return ResponseEntity.ok(new ApiResponse<>(true, "All KEDB records", service.getAllKerRecords()));
	}

	@GetMapping("/kedb/search")
	public ResponseEntity<ApiResponse<List<KnownErrorRecordResponse>>> searchKedb(
			@RequestParam(required = false) String keyword) {
		return ResponseEntity.ok(new ApiResponse<>(true, "KEDB search results", service.searchKedb(keyword)));
	}

	@GetMapping("/health")
	public ResponseEntity<ApiResponse<String>> health() {
		return ResponseEntity.ok(new ApiResponse<>(true, "Problem service running", "UP"));
	}
}
