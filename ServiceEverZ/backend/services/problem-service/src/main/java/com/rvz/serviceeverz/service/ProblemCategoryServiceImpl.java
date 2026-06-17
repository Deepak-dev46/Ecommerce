package com.rvz.serviceeverz.service;



import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rvz.serviceeverz.dto.request.ProblemCategoryRequest;
import com.rvz.serviceeverz.dto.request.ProblemSubCategoryRequest;
import com.rvz.serviceeverz.dto.response.ProblemCategoryResponse;
import com.rvz.serviceeverz.entity.ProblemCategory;
import com.rvz.serviceeverz.entity.ProblemSubCategory;
import com.rvz.serviceeverz.exception.ProblemNotFoundException;
import com.rvz.serviceeverz.repository.ProblemCategoryRepository;
import com.rvz.serviceeverz.repository.ProblemSubCategoryRepository;

@Service
public class ProblemCategoryServiceImpl implements ProblemCategoryService {

	private final ProblemCategoryRepository categoryRepo;
	private final ProblemSubCategoryRepository subCategoryRepo;

	public ProblemCategoryServiceImpl(ProblemCategoryRepository categoryRepo,
			ProblemSubCategoryRepository subCategoryRepo) {
		this.categoryRepo = categoryRepo;
		this.subCategoryRepo = subCategoryRepo;
	}

	private ProblemCategoryResponse toResponse(ProblemCategory cat) {
		ProblemCategoryResponse r = new ProblemCategoryResponse();
		r.setId(cat.getId());
		r.setName(cat.getName());
		r.setDescription(cat.getDescription());
		r.setIsActive(cat.getIsActive());
		r.setCreatedAt(cat.getCreatedAt());
		List<ProblemCategoryResponse.SubCategoryDto> subs = cat.getSubCategories().stream().map(s -> {
			ProblemCategoryResponse.SubCategoryDto dto = new ProblemCategoryResponse.SubCategoryDto();
			dto.setId(s.getId());
			dto.setName(s.getName());
			dto.setDescription(s.getDescription());
			dto.setIsActive(s.getIsActive());
			return dto;
		}).collect(Collectors.toList());
		r.setSubCategories(subs);
		return r;
	}

	@Override
	@Transactional
	public ProblemCategoryResponse createCategory(ProblemCategoryRequest request) {
		if (categoryRepo.existsByNameIgnoreCase(request.getName()))
			throw new IllegalArgumentException("Category already exists: " + request.getName());
		ProblemCategory cat = new ProblemCategory();
		cat.setName(request.getName());
		cat.setDescription(request.getDescription());
		return toResponse(categoryRepo.save(cat));
	}

	@Override
	@Transactional
	public ProblemCategoryResponse updateCategory(Long id, ProblemCategoryRequest request) {
		ProblemCategory cat = categoryRepo.findById(id)
				.orElseThrow(() -> new ProblemNotFoundException("Category not found: " + id));
		cat.setName(request.getName());
		cat.setDescription(request.getDescription());
		return toResponse(categoryRepo.save(cat));
	}

	@Override
	@Transactional
	public void deactivateCategory(Long id) {
		ProblemCategory cat = categoryRepo.findById(id)
				.orElseThrow(() -> new ProblemNotFoundException("Category not found: " + id));
		cat.setIsActive(false);
		categoryRepo.save(cat);
	}

	@Override
	public ProblemCategoryResponse getCategoryById(Long id) {
		return toResponse(
				categoryRepo.findById(id).orElseThrow(() -> new ProblemNotFoundException("Category not found: " + id)));
	}

	@Override
	public List<ProblemCategoryResponse> getAllCategories() {
		return categoryRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
	}

	@Override
	public List<ProblemCategoryResponse> getAllActiveCategories() {
		return categoryRepo.findAllByIsActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
	}

	@Override
	@Transactional
	public ProblemCategoryResponse createSubCategory(ProblemSubCategoryRequest request) {
		ProblemCategory cat = categoryRepo.findById(request.getCategoryId())
				.orElseThrow(() -> new ProblemNotFoundException("Category not found: " + request.getCategoryId()));
		if (subCategoryRepo.existsByNameIgnoreCaseAndCategoryId(request.getName(), request.getCategoryId()))
			throw new IllegalArgumentException("Sub-category already exists: " + request.getName());
		ProblemSubCategory sub = new ProblemSubCategory();
		sub.setName(request.getName());
		sub.setDescription(request.getDescription());
		sub.setCategory(cat);
		subCategoryRepo.save(sub);
		return toResponse(categoryRepo.findById(cat.getId()).get());
	}

	@Override
	@Transactional
	public ProblemCategoryResponse updateSubCategory(Long subCatId, ProblemSubCategoryRequest request) {
		ProblemSubCategory sub = subCategoryRepo.findById(subCatId)
				.orElseThrow(() -> new ProblemNotFoundException("Sub-category not found: " + subCatId));
		sub.setName(request.getName());
		sub.setDescription(request.getDescription());
		subCategoryRepo.save(sub);
		return toResponse(sub.getCategory());
	}

	@Override
	@Transactional
	public void deactivateSubCategory(Long subCatId) {
		ProblemSubCategory sub = subCategoryRepo.findById(subCatId)
				.orElseThrow(() -> new ProblemNotFoundException("Sub-category not found: " + subCatId));
		sub.setIsActive(false);
		subCategoryRepo.save(sub);
	}
}
