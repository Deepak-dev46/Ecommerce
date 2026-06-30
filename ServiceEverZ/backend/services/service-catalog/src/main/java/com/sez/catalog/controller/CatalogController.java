package com.sez.catalog.controller;

import com.sez.catalog.dto.CatalogDtos;
import com.sez.catalog.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/service-catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    // ── Service Types ──────────────────────────────────────────────
    @GetMapping("/serviceTypes")
    public ResponseEntity<List<CatalogDtos.ServiceTypeResponse>> getAllTypes() {
        return ResponseEntity.ok(catalogService.getAllTypes());
    }

    @PostMapping("/serviceTypes")
    public ResponseEntity<CatalogDtos.ServiceTypeResponse> createType(
            @RequestBody CatalogDtos.ServiceTypeRequest req) {
        return ResponseEntity.ok(catalogService.createType(req));
    }

    @PutMapping("/serviceTypes/{id}")
    public ResponseEntity<CatalogDtos.ServiceTypeResponse> updateType(
            @PathVariable Long id, @RequestBody CatalogDtos.ServiceTypeRequest req) {
        return ResponseEntity.ok(catalogService.updateType(id, req));
    }

    @DeleteMapping("/serviceTypes/{id}")
    public ResponseEntity<Void> deleteType(@PathVariable Long id) {
        catalogService.deleteType(id);
        return ResponseEntity.noContent().build();
    }

    // ── Categories ──────────────────────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<List<CatalogDtos.CategoryResponse>> getCategories(
            @RequestParam(required = false) Long serviceTypeId) {
        if (serviceTypeId != null) {
            return ResponseEntity.ok(catalogService.getCategoriesByType(serviceTypeId));
        }
        return ResponseEntity.ok(catalogService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<CatalogDtos.CategoryResponse> createCategory(
            @RequestBody CatalogDtos.CategoryRequest req) {
        return ResponseEntity.ok(catalogService.createCategory(req));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CatalogDtos.CategoryResponse> updateCategory(
            @PathVariable Long id, @RequestBody CatalogDtos.CategoryRequest req) {
        return ResponseEntity.ok(catalogService.updateCategory(id, req));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        catalogService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ── Subcategories ──────────────────────────────────────────────
    @GetMapping("/subcategories")
    public ResponseEntity<List<CatalogDtos.SubcategoryResponse>> getSubcategories(
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(catalogService.getSubcategoriesByCategory(categoryId));
    }

    @PostMapping("/subcategories")
    public ResponseEntity<CatalogDtos.SubcategoryResponse> createSubcategory(
            @RequestBody CatalogDtos.SubcategoryRequest req) {
        return ResponseEntity.ok(catalogService.createSubcategory(req));
    }

    @PutMapping("/subcategories/{id}")
    public ResponseEntity<CatalogDtos.SubcategoryResponse> updateSubcategory(
            @PathVariable Long id, @RequestBody CatalogDtos.SubcategoryRequest req) {
        return ResponseEntity.ok(catalogService.updateSubcategory(id, req));
    }

    @DeleteMapping("/subcategories/{id}")
    public ResponseEntity<Void> deleteSubcategory(@PathVariable Long id) {
        catalogService.deleteSubcategory(id);
        return ResponseEntity.noContent().build();
    }

    // ── Services/Items ──────────────────────────────────────────────
    /**
     * GET /services → manager view (all items)
     * GET /services?activeOnly=true → end-user view (active items only)
     * GET /services?subcategoryId=X → manager subcategory filter
     * GET /services?subcategoryId=X&activeOnly=true → end-user subcategory filter
     */
    @GetMapping("/services")
    public ResponseEntity<List<CatalogDtos.ServiceItemResponse>> getServices(
            @RequestParam(required = false) Long subcategoryId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        if (subcategoryId != null) {
            return ResponseEntity.ok(catalogService.getServicesBySubcategory(subcategoryId, activeOnly));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(catalogService.getServicesByCategory(categoryId, activeOnly));
        }
        return ResponseEntity.ok(catalogService.getAllServices(activeOnly));
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<CatalogDtos.ServiceItemResponse> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getServiceById(id));
    }

    @PostMapping("/services")
    public ResponseEntity<CatalogDtos.ServiceItemResponse> createService(
            @RequestBody CatalogDtos.ServiceItemRequest req) {
        return ResponseEntity.ok(catalogService.createService(req));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<CatalogDtos.ServiceItemResponse> updateService(
            @PathVariable Long id, @RequestBody CatalogDtos.ServiceItemRequest req) {
        return ResponseEntity.ok(catalogService.updateService(id, req));
    }

    /**
     * PATCH /services/{id}/toggle-active
     * ITSM Manager toggles a catalog item between active and inactive.
     * Role check is enforced at the API Gateway via X-User-Role header.
     */
    @PatchMapping("/services/{id}/toggle-active")
    public ResponseEntity<CatalogDtos.ServiceItemResponse> toggleServiceActive(
            @PathVariable Long id) {
        return ResponseEntity.ok(catalogService.toggleServiceActive(id));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        catalogService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    // ── Requests ──────────────────────────────────────────────
    @PostMapping("/requests")
    public ResponseEntity<CatalogDtos.ServiceRequestResponse> submitRequest(
            @RequestBody CatalogDtos.SubmitRequestBody body) {
        return ResponseEntity.ok(catalogService.submitRequest(body));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<CatalogDtos.ServiceRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(catalogService.getAllRequests());
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<CatalogDtos.ServiceRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getRequestById(id));
    }

    @PatchMapping("/requests/{id}")
    public ResponseEntity<CatalogDtos.ServiceRequestResponse> patchRequest(
            @PathVariable Long id, @RequestBody CatalogDtos.PatchRequestBody body) {
        return ResponseEntity.ok(catalogService.patchRequest(id, body));
    }

    // ── Manager: Catalog Tree ──────────────────────────────────────────────
    // FIX: Removed duplicate /api/ prefix. Class is mapped to "api/service-catalog"
    // so these resolve to: /api/service-catalog/manager/...
    @GetMapping("/manager/tree")
    public ResponseEntity<List<CatalogDtos.CatalogTreeNode>> getCatalogTree() {
        return ResponseEntity.ok(catalogService.getCatalogTree());
    }

    @PostMapping("/manager/categories")
    public ResponseEntity<CatalogDtos.CategoryResponse> managerCreateCategory(
            @RequestBody CatalogDtos.CategoryRequest req) {
        return ResponseEntity.ok(catalogService.createCategory(req));
    }

    @GetMapping("/manager/categories/exists")
    public ResponseEntity<Boolean> checkCategoryExists(
            @RequestParam String name, @RequestParam String type) {
        boolean exists = catalogService.getAllCategories().stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(name));
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/manager/subcategories")
    public ResponseEntity<CatalogDtos.SubcategoryResponse> managerCreateSubcategory(
            @RequestBody CatalogDtos.SubcategoryRequest req) {
        return ResponseEntity.ok(catalogService.createSubcategory(req));
    }

    @GetMapping("/manager/subcategories/exists")
    public ResponseEntity<Boolean> checkSubcategoryExists(
            @RequestParam String name, @RequestParam Long categoryId) {
        boolean exists = catalogService.getSubcategoriesByCategory(categoryId).stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(name));
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/manager/items")
    public ResponseEntity<CatalogDtos.ServiceItemResponse> managerCreateItem(
            @RequestBody CatalogDtos.ServiceItemRequest req) {
        return ResponseEntity.ok(catalogService.createService(req));
    }

    @GetMapping("/roles")
    public ResponseEntity<List<java.util.Map<String, Object>>> getRoles() {
        List<java.util.Map<String, Object>> roles = List.of(
                java.util.Map.of("id", 1, "name", "ADMIN"),
                java.util.Map.of("id", 2, "name", "RMO"),
                java.util.Map.of("id", 3, "name", "ITSM_MANAGER"),
                java.util.Map.of("id", 4, "name", "END_USER"),
                java.util.Map.of("id", 5, "name", "SUPPORT_PERSONNEL"),
                java.util.Map.of("id", 6, "name", "APPROVAL_MANAGER_L1"),
                java.util.Map.of("id", 7, "name", "APPROVAL_MANAGER_L2"),
                java.util.Map.of("id", 8, "name", "RESOURCE_OWNER"));
        return ResponseEntity.ok(roles);
    }
}
