package com.rvz.masterdataservice.service.impl;

import com.rvz.masterdataservice.config.MasterDataMapper;
import com.rvz.masterdataservice.dto.response.*;
import com.rvz.masterdataservice.entity.User;
import com.rvz.masterdataservice.exception.ResourceNotFoundException;
import com.rvz.masterdataservice.repository.*;
import com.rvz.masterdataservice.service.MasterDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MasterDataServiceImpl implements MasterDataService {

    private static final Logger log = LoggerFactory.getLogger(MasterDataServiceImpl.class);
    private static final String ITEM_NOT_FOUND    = "Service item not found with id: ";
    private static final String PROJECT_NOT_FOUND = "Project not found with id: ";

    private final ServiceTypeRepository         serviceTypeRepository;
    private final ServiceCategoryRepository     serviceCategoryRepository;
    private final ServiceSubcategoryRepository  serviceSubcategoryRepository;
    private final ServiceItemRepository         serviceItemRepository;
    private final PrioritySlaRepository         prioritySlaRepository;
    private final ComplexityEffortRepository    complexityEffortRepository;
    private final ProjectRepository             projectRepository;
    private final ProjectAssignmentRepository   projectAssignmentRepository;
    private final UserRepository                userRepository;
    private final MasterDataMapper              mapper;

    public MasterDataServiceImpl(
            ServiceTypeRepository serviceTypeRepository,
            ServiceCategoryRepository serviceCategoryRepository,
            ServiceSubcategoryRepository serviceSubcategoryRepository,
            ServiceItemRepository serviceItemRepository,
            PrioritySlaRepository prioritySlaRepository,
            ComplexityEffortRepository complexityEffortRepository,
            ProjectRepository projectRepository,
            ProjectAssignmentRepository projectAssignmentRepository,
            UserRepository userRepository,
            MasterDataMapper mapper) {
        this.serviceTypeRepository        = serviceTypeRepository;
        this.serviceCategoryRepository    = serviceCategoryRepository;
        this.serviceSubcategoryRepository = serviceSubcategoryRepository;
        this.serviceItemRepository        = serviceItemRepository;
        this.prioritySlaRepository        = prioritySlaRepository;
        this.complexityEffortRepository   = complexityEffortRepository;
        this.projectRepository            = projectRepository;
        this.projectAssignmentRepository  = projectAssignmentRepository;
        this.userRepository               = userRepository;
        this.mapper                       = mapper;
    }

    // ── EXISTING IMPLEMENTATIONS – NOT MODIFIED ──────────────────────────────

    @Override
    public List<ServiceTypeResponse> getAllServiceTypes() {
        log.info("Fetching all service types");
        return serviceTypeRepository.findAll()
                .stream()
                .map(mapper::toServiceTypeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceCategoryResponse> getCategoriesByTypeId(Integer typeId) {
        log.info("Fetching categories for typeId={}", typeId);
        return serviceCategoryRepository.findByServiceType_TypeId(typeId)
                .stream()
                .map(mapper::toServiceCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceSubcategoryResponse> getSubcategoriesByCategoryId(Integer categoryId) {
        log.info("Fetching subcategories for categoryId={}", categoryId);
        return serviceSubcategoryRepository.findByServiceCategory_CategoryId(categoryId)
                .stream()
                .map(mapper::toServiceSubcategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceItemResponse> getItemsBySubcategoryId(Integer subcategoryId) {
        log.info("Fetching items for subcategoryId={}", subcategoryId);
        return serviceItemRepository.findByServiceSubcategory_SubcategoryId(subcategoryId)
                .stream()
                .map(mapper::toServiceItemResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceItemResponse getItemById(Integer serviceId) {
        log.info("Fetching service item with id={}", serviceId);
        return serviceItemRepository.findById(serviceId)
                .map(mapper::toServiceItemResponse)
                .orElseThrow(() -> new ResourceNotFoundException(ITEM_NOT_FOUND + serviceId));
    }

    @Override
    public List<ServiceItemResponse> getAllActiveItems() {
        log.info("Fetching all active service items");
        return serviceItemRepository.findByStatus("ACTIVE")
                .stream()
                .map(mapper::toServiceItemResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrioritySlaResponse> getAllPrioritySla() {
        log.info("Fetching all priority SLA configurations");
        return prioritySlaRepository.findAll()
                .stream()
                .map(mapper::toPrioritySlaResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplexityEffortResponse> getAllComplexityEffort() {
        log.info("Fetching all complexity effort configurations");
        return complexityEffortRepository.findAll()
                .stream()
                .map(mapper::toComplexityEffortResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        log.info("Fetching all projects");
        return projectRepository.findAll()
                .stream()
                .map(mapper::toProjectResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getProjectById(Long id) {
        log.info("Fetching project with id={}", id);
        return projectRepository.findById(id)
                .map(mapper::toProjectResponse)
                .orElseThrow(() -> new ResourceNotFoundException(PROJECT_NOT_FOUND + id));
    }

    @Override
    public List<ProjectAssignmentResponse> getAssignmentsByUserId(Long userId) {
        log.info("Fetching project assignments for userId={}", userId);
        return projectAssignmentRepository.findByUserId(userId)
                .stream()
                .map(mapper::toProjectAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectAssignmentResponse> getAssignmentsByProjectId(Long projectId) {
        log.info("Fetching project assignments for projectId={}", projectId);
        return projectAssignmentRepository.findByProjectId(projectId)
                .stream()
                .map(mapper::toProjectAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceCategoryResponse getCategoryById(Integer categoryId) {
        log.info("Fetching category with id={}", categoryId);
        return serviceCategoryRepository.findById(categoryId)
                .map(mapper::toServiceCategoryResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    @Override
    public ServiceSubcategoryResponse getSubcategoryById(Integer subcategoryId) {
        log.info("Fetching subcategory with id={}", subcategoryId);
        return serviceSubcategoryRepository.findById(subcategoryId)
                .map(mapper::toServiceSubcategoryResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found with id: " + subcategoryId));
    }

    @Override
    public PrioritySlaResponse getPriorityById(Integer priorityId) {
        log.info("Fetching priority with id={}", priorityId);
        return prioritySlaRepository.findById(priorityId)
                .map(mapper::toPrioritySlaResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Priority not found with id: " + priorityId));
    }

    @Override
    public List<UserResponse> getUsersByDesignation(String designation) {
        log.info("Fetching users with designation={}", designation);
        try {
            User.Designation desig = User.Designation.valueOf(designation.toUpperCase());
            return userRepository.findAll().stream()
                    .filter(u -> desig.equals(u.getDesignation()) && User.Status.ACTIVE.equals(u.getStatus()))
                    .map(u -> {
                        UserResponse r = new UserResponse();
                        r.setId(u.getId());
                        r.setFullName(u.getFullName());
                        r.setEmail(u.getEmail());
                        r.setDesignation(u.getDesignation() != null ? u.getDesignation().name() : null);
                        r.setDepartment(u.getDepartment() != null ? u.getDepartment().name() : null);
                        r.setStatus(u.getStatus() != null ? u.getStatus().name() : null);
                        return r;
                    })
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return java.util.Collections.emptyList();
        }
    }

    // ── NEW IMPLEMENTATIONS – Added for email-ticket-service (Story 22) ──────
    // Uses existing repositories' findAll() — no new repository methods needed.

    @Override
    public List<ServiceCategoryResponse> getAllCategories() {
        log.info("Fetching all categories (email-ticket-service)");
        return serviceCategoryRepository.findAll()
                .stream()
                .map(mapper::toServiceCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceSubcategoryResponse> getAllSubcategories() {
        log.info("Fetching all subcategories (email-ticket-service)");
        return serviceSubcategoryRepository.findAll()
                .stream()
                .map(mapper::toServiceSubcategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceItemResponse> getAllItems() {
        log.info("Fetching all service items (email-ticket-service)");
        return serviceItemRepository.findAll()
                .stream()
                .map(mapper::toServiceItemResponse)
                .collect(Collectors.toList());
    }
}
