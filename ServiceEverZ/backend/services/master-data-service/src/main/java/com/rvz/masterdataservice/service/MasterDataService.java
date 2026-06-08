package com.rvz.masterdataservice.service;

import com.rvz.masterdataservice.dto.response.*;
import java.util.List;

public interface MasterDataService {

    // ── EXISTING METHODS – NOT MODIFIED ─────────────────────────────────────

    List<ServiceTypeResponse> getAllServiceTypes();

    List<ServiceCategoryResponse> getCategoriesByTypeId(Integer typeId);

    List<ServiceSubcategoryResponse> getSubcategoriesByCategoryId(Integer categoryId);

    List<ServiceItemResponse> getItemsBySubcategoryId(Integer subcategoryId);

    ServiceItemResponse getItemById(Integer serviceId);

    List<ServiceItemResponse> getAllActiveItems();

    ServiceCategoryResponse getCategoryById(Integer categoryId);

    ServiceSubcategoryResponse getSubcategoryById(Integer subcategoryId);

    PrioritySlaResponse getPriorityById(Integer priorityId);

    List<UserResponse> getUsersByDesignation(String designation);

    List<PrioritySlaResponse> getAllPrioritySla();

    List<ComplexityEffortResponse> getAllComplexityEffort();

    List<ProjectResponse> getAllProjects();

    ProjectResponse getProjectById(Long id);

    List<ProjectAssignmentResponse> getAssignmentsByUserId(Long userId);

    List<ProjectAssignmentResponse> getAssignmentsByProjectId(Long projectId);

    // ── NEW METHODS – Added for email-ticket-service (Story 22) ─────────────
    // These allow the email service to fetch all records and search by name
    // without requiring a typeId / categoryId / subcategoryId filter.

    /** Returns all categories across all types. Used by email-ticket-service to resolve categoryId by name. */
    List<ServiceCategoryResponse> getAllCategories();

    /** Returns all subcategories across all categories. Used by email-ticket-service to resolve subcategoryId by name. */
    List<ServiceSubcategoryResponse> getAllSubcategories();

    /** Returns all service items across all subcategories. Used by email-ticket-service to resolve itemId by name. */
    List<ServiceItemResponse> getAllItems();
}
