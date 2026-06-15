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
    // Frontend: GET /serviceTypes
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
    // Frontend: GET /categories  or  GET /categories?serviceTypeId=X
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
    // Frontend: GET /subcategories?categoryId=X
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
    // Frontend: GET /services  or  GET /services?subcategoryId=X  or  GET /services?categoryId=X
    @GetMapping("/services")
    public ResponseEntity<List<CatalogDtos.ServiceItemResponse>> getServices(
            @RequestParam(required = false) Long subcategoryId,
            @RequestParam(required = false) Long categoryId) {
        if (subcategoryId != null) {
            return ResponseEntity.ok(catalogService.getServicesBySubcategory(subcategoryId));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(catalogService.getServicesByCategory(categoryId));
        }
        return ResponseEntity.ok(catalogService.getAllServices());
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

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        catalogService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    // ── Requests ──────────────────────────────────────────────
    // Frontend: POST /requests, GET /requests, GET /requests/:id, PATCH /requests/:id
    @PostMapping("/re	quests")
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
    // managerCatalogApi uses: GET api/manager/service-catalog/tree
    @GetMapping("/api/manager/service-catalog/tree")
    public ResponseEntity<List<CatalogDtos.CatalogTreeNode>> getCatalogTree() {
        return ResponseEntity.ok(catalogService.getCatalogTree());
    }

    // Manager category/subcategory/item creation
    @PostMapping("/api/manager/categories")
    public ResponseEntity<CatalogDtos.CategoryResponse> managerCreateCategory(
            @RequestBody CatalogDtos.CategoryRequest req) {
        return ResponseEntity.ok(catalogService.createCategory(req));
    }

    @GetMapping("/api/manager/categories/exists")
    public ResponseEntity<Boolean> checkCategoryExists(
            @RequestParam String name, @RequestParam String type) {
        boolean exists = catalogService.getAllCategories().stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(name));
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/api/manager/subcategories")
    public ResponseEntity<CatalogDtos.SubcategoryResponse> managerCreateSubcategory(
            @RequestBody CatalogDtos.SubcategoryRequest req) {
        return ResponseEntity.ok(catalogService.createSubcategory(req));
    }

    @GetMapping("/api/manager/subcategories/exists")
    public ResponseEntity<Boolean> checkSubcategoryExists(
            @RequestParam String name, @RequestParam Long categoryId) {
        boolean exists = catalogService.getSubcategoriesByCategory(categoryId).stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(name));
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/api/manager/items")
    public ResponseEntity<CatalogDtos.ServiceItemResponse> managerCreateItem(
            @RequestBody CatalogDtos.ServiceItemRequest req) {
        return ResponseEntity.ok(catalogService.createService(req));
    }

    // Also expose roles list (used by Items tab dialog)
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
            java.util.Map.of("id", 8, "name", "RESOURCE_OWNER")
        );
        return ResponseEntity.ok(roles);
    }
}
