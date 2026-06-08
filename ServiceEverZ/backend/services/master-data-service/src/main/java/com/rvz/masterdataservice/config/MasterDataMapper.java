package com.rvz.masterdataservice.config;

import com.rvz.masterdataservice.dto.response.*;
import com.rvz.masterdataservice.entity.*;
import org.springframework.stereotype.Component;

@Component
public class MasterDataMapper {

    public ServiceTypeResponse toServiceTypeResponse(ServiceType entity) {
        ServiceTypeResponse dto = new ServiceTypeResponse();
        dto.setTypeId(entity.getTypeId());
        dto.setTypeName(entity.getTypeName());
        return dto;
    }

    public ServiceCategoryResponse toServiceCategoryResponse(ServiceCategory entity) {
        ServiceCategoryResponse dto = new ServiceCategoryResponse();
        dto.setCategoryId(entity.getCategoryId());
        dto.setCategoryName(entity.getCategoryName());
        if (entity.getServiceType() != null) {
            dto.setTypeId(entity.getServiceType().getTypeId());
        }
        return dto;
    }

    public ServiceSubcategoryResponse toServiceSubcategoryResponse(ServiceSubcategory entity) {
        ServiceSubcategoryResponse dto = new ServiceSubcategoryResponse();
        dto.setSubcategoryId(entity.getSubcategoryId());
        dto.setSubcategoryName(entity.getSubcategoryName());
        if (entity.getServiceCategory() != null) {
            dto.setCategoryId(entity.getServiceCategory().getCategoryId());
        }
        return dto;
    }

    public ServiceItemResponse toServiceItemResponse(ServiceItem entity) {
        ServiceItemResponse dto = new ServiceItemResponse();
        dto.setServiceId(entity.getServiceId());
        dto.setServiceName(entity.getServiceName());
        dto.setDefaultPriority(entity.getDefaultPriority());
        dto.setDefaultComplexity(entity.getDefaultComplexity());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        if (entity.getServiceType() != null) {
            dto.setTypeId(entity.getServiceType().getTypeId());
        }
        if (entity.getServiceCategory() != null) {
            dto.setCategoryId(entity.getServiceCategory().getCategoryId());
        }
        if (entity.getServiceSubcategory() != null) {
            dto.setSubcategoryId(entity.getServiceSubcategory().getSubcategoryId());
        }
        return dto;
    }

    public PrioritySlaResponse toPrioritySlaResponse(PrioritySla entity) {
        PrioritySlaResponse dto = new PrioritySlaResponse();
        dto.setPriorityId(entity.getPriorityId());
        dto.setPriorityName(entity.getPriorityName());
        dto.setResponseTimeHours(entity.getResponseTimeHours());
        dto.setResolutionTimeHours(entity.getResolutionTimeHours());
        dto.setBreachTimeHours(entity.getBreachTimeHours());
        return dto;
    }

    public ComplexityEffortResponse toComplexityEffortResponse(ComplexityEffort entity) {
        ComplexityEffortResponse dto = new ComplexityEffortResponse();
        dto.setComplexityId(entity.getComplexityId());
        dto.setComplexityLevel(entity.getComplexityLevel());
        dto.setEffortHours(entity.getEffortHours());
        return dto;
    }

    public ProjectResponse toProjectResponse(Project entity) {
        ProjectResponse dto = new ProjectResponse();
        dto.setId(entity.getId());
        dto.setProjectCode(entity.getProjectCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setProjectCategory(entity.getProjectCategory());
        dto.setResourceOwnerId(entity.getResourceOwnerId());
        dto.setL1ManagerId(entity.getL1ManagerId());
        dto.setL2ManagerId(entity.getL2ManagerId());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public ProjectAssignmentResponse toProjectAssignmentResponse(ProjectAssignment entity) {
        ProjectAssignmentResponse dto = new ProjectAssignmentResponse();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setProjectId(entity.getProjectId());
        dto.setStatus(entity.getStatus());
        dto.setAssignedBy(entity.getAssignedBy());
        dto.setAssignedAt(entity.getAssignedAt());
        dto.setRemovedAt(entity.getRemovedAt());
        return dto;
    }
}
