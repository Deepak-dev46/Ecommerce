package com.rvz.serviceeverz.service;

import java.util.List;

import com.rvz.serviceeverz.dto.request.ProblemCategoryRequest;
import com.rvz.serviceeverz.dto.request.ProblemSubCategoryRequest;
import com.rvz.serviceeverz.dto.response.ProblemCategoryResponse;

public interface ProblemCategoryService {
	ProblemCategoryResponse createCategory(ProblemCategoryRequest request);

	ProblemCategoryResponse updateCategory(Long id, ProblemCategoryRequest request);

	void deactivateCategory(Long id);

	ProblemCategoryResponse getCategoryById(Long id);

	List<ProblemCategoryResponse> getAllCategories();

	List<ProblemCategoryResponse> getAllActiveCategories();

	ProblemCategoryResponse createSubCategory(ProblemSubCategoryRequest request);

	ProblemCategoryResponse updateSubCategory(Long subCatId, ProblemSubCategoryRequest request);

	void deactivateSubCategory(Long subCatId);
}
