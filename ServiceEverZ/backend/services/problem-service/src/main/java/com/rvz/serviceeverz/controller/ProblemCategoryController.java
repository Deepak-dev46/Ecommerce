package com.rvz.serviceeverz.controller;



import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rvz.serviceeverz.dto.request.ProblemCategoryRequest;
import com.rvz.serviceeverz.dto.request.ProblemSubCategoryRequest;
import com.rvz.serviceeverz.dto.response.ApiResponse;
import com.rvz.serviceeverz.dto.response.ProblemCategoryResponse;
import com.rvz.serviceeverz.service.ProblemCategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/problem-categories")
//@CrossOrigin
public class ProblemCategoryController {

	private final ProblemCategoryService service;

	public ProblemCategoryController(ProblemCategoryService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<ProblemCategoryResponse>> create(
			@Valid @RequestBody ProblemCategoryRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(true, "Category created", service.createCategory(request)));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ProblemCategoryResponse>> update(@PathVariable Long id,
			@Valid @RequestBody ProblemCategoryRequest request) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Category updated", service.updateCategory(id, request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<String>> deactivate(@PathVariable Long id) {
		service.deactivateCategory(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "Category deactivated", null));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ProblemCategoryResponse>> getById(@PathVariable Long id) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Category fetched", service.getCategoryById(id)));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<ProblemCategoryResponse>>> getAll(
			@RequestParam(defaultValue = "true") boolean activeOnly) {
		List<ProblemCategoryResponse> list = activeOnly ? service.getAllActiveCategories() : service.getAllCategories();
		return ResponseEntity.ok(new ApiResponse<>(true, "Categories fetched", list));
	}

	@PostMapping("/sub-categories")
	public ResponseEntity<ApiResponse<ProblemCategoryResponse>> createSub(
			@Valid @RequestBody ProblemSubCategoryRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(true, "Sub-category created", service.createSubCategory(request)));
	}

	@PutMapping("/sub-categories/{subCatId}")
	public ResponseEntity<ApiResponse<ProblemCategoryResponse>> updateSub(@PathVariable Long subCatId,
			@Valid @RequestBody ProblemSubCategoryRequest request) {
		return ResponseEntity
				.ok(new ApiResponse<>(true, "Sub-category updated", service.updateSubCategory(subCatId, request)));
	}

	@DeleteMapping("/sub-categories/{subCatId}")
	public ResponseEntity<ApiResponse<String>> deactivateSub(@PathVariable Long subCatId) {
		service.deactivateSubCategory(subCatId);
		return ResponseEntity.ok(new ApiResponse<>(true, "Sub-category deactivated", null));
	}
}
