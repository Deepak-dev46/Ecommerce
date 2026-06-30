package com.sez.catalog.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.sez.catalog.entity.Role;

public class CatalogDtos {

    // ── ServiceType ──────────────────────────────────────────────
    public static class ServiceTypeRequest {
        private String name;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class ServiceTypeResponse {
        private Long id;
        private String name;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    // ── Category ──────────────────────────────────────────────
    public static class CategoryRequest {
        private String name;
        private Long serviceTypeId;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getServiceTypeId() { return serviceTypeId; }
        public void setServiceTypeId(Long serviceTypeId) { this.serviceTypeId = serviceTypeId; }
    }

    public static class CategoryResponse {
        private Long id;
        private String name;
        private Long serviceTypeId;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getServiceTypeId() { return serviceTypeId; }
        public void setServiceTypeId(Long serviceTypeId) { this.serviceTypeId = serviceTypeId; }
    }

    // ── Subcategory ──────────────────────────────────────────────
    public static class SubcategoryRequest {
        private String name;
        private Long categoryId;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    }

    public static class SubcategoryResponse {
        private Long id;
        private String name;
        private Long categoryId;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    }

    // ── Service Item ──────────────────────────────────────────────
    public static class ServiceItemRequest {
        private String name;
        private String description;
        private Long categoryId;
        private Long subcategoryId;
        private Integer slaHours;
        private boolean requiresApproval;
        private Role approvalRole;
        private boolean accessDateRequired;
        private boolean active = true;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        public Long getSubcategoryId() { return subcategoryId; }
        public void setSubcategoryId(Long subcategoryId) { this.subcategoryId = subcategoryId; }
        public Integer getSlaHours() { return slaHours; }
        public void setSlaHours(Integer slaHours) { this.slaHours = slaHours; }
        public boolean isRequiresApproval() { return requiresApproval; }
        public void setRequiresApproval(boolean requiresApproval) { this.requiresApproval = requiresApproval; }
		public Role getApprovalRole() {
			return approvalRole;
		}
		public void setApprovalRole(Role approvalRole) {
			this.approvalRole = approvalRole;
		}
        public boolean isAccessDateRequired() { return accessDateRequired; }
        public void setAccessDateRequired(boolean accessDateRequired) { this.accessDateRequired = accessDateRequired; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }

    public static class ServiceItemResponse {
        private Long id;
        private String name;
        private String description;
        private Long categoryId;
        private Long subcategoryId;
        private Integer slaHours;
        private boolean requiresApproval;
        private Role approvalRole;
        private boolean accessDateRequired;
        private boolean active;

        public void setApprovalRole(Role approvalRole) {
			this.approvalRole = approvalRole;
		}
		public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
		public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        public Long getSubcategoryId() { return subcategoryId; }
        public void setSubcategoryId(Long subcategoryId) { this.subcategoryId = subcategoryId; }
        public Integer getSlaHours() { return slaHours; }
        public void setSlaHours(Integer slaHours) { this.slaHours = slaHours; }
        public boolean isRequiresApproval() { return requiresApproval; }
        public void setRequiresApproval(boolean requiresApproval) { this.requiresApproval = requiresApproval; }
        public boolean isAccessDateRequired() { return accessDateRequired; }
public void setAccessDateRequired(boolean accessDateRequired) { this.accessDateRequired = accessDateRequired; }
    }

    // ── Request ──────────────────────────────────────────────
    public static class SubmitRequestBody {
        private Long serviceId;
        private Long requestedBy;
        private String notes;
        private String status;

        public Long getServiceId() { return serviceId; }
        public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
        public Long getRequestedBy() { return requestedBy; }
        public void setRequestedBy(Long requestedBy) { this.requestedBy = requestedBy; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class PatchRequestBody {
        private String status;
        private String cancellationReason;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCancellationReason() { return cancellationReason; }
        public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    }

    public static class ServiceRequestResponse {
        private Long id;
        private Long serviceId;
        private String serviceName;
        private Long requestedBy;
        private String status;
        private String notes;
        private String cancellationReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getServiceId() { return serviceId; }
        public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public Long getRequestedBy() { return requestedBy; }
        public void setRequestedBy(Long requestedBy) { this.requestedBy = requestedBy; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getCancellationReason() { return cancellationReason; }
        public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    // ── Tree Node (manager view) ──────────────────────────────────────────────
    public static class CatalogTreeNode {
        private Long id;
        private String name;
        private List<CategoryTreeNode> categories;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<CategoryTreeNode> getCategories() { return categories; }
        public void setCategories(List<CategoryTreeNode> categories) { this.categories = categories; }
    }

    public static class CategoryTreeNode {
        private Long id;
        private String name;
        private List<SubcategoryTreeNode> subcategories;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<SubcategoryTreeNode> getSubcategories() { return subcategories; }
        public void setSubcategories(List<SubcategoryTreeNode> subcategories) { this.subcategories = subcategories; }
    }

    public static class SubcategoryTreeNode {
        private Long id;
        private String name;
        private List<ServiceItemResponse> items;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<ServiceItemResponse> getItems() { return items; }
        public void setItems(List<ServiceItemResponse> items) { this.items = items; }
    }

    // ── Error ──────────────────────────────────────────────
    public static class ErrorResponse {
        private int status;
        private String message;
        public ErrorResponse(int status, String message) { this.status = status; this.message = message; }
        public int getStatus() { return status; }
        public String getMessage() { return message; }
    }
}
