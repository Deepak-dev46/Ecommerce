package com.sez.catalog.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sez.catalog.dto.CatalogDtos;
import com.sez.catalog.entity.Category;
import com.sez.catalog.entity.ServiceRequest;
import com.sez.catalog.entity.ServiceType;
import com.sez.catalog.entity.Subcategory;
import com.sez.catalog.exception.DeleteNotAllowedException;
import com.sez.catalog.repository.CategoryRepository;
import com.sez.catalog.repository.ServiceItemRepository;
import com.sez.catalog.repository.ServiceRequestRepository;
import com.sez.catalog.repository.ServiceTypeRepository;
import com.sez.catalog.repository.SubcategoryRepository;

@Service
public class CatalogService {

    private final ServiceTypeRepository typeRepo;
    private final CategoryRepository catRepo;
    private final SubcategoryRepository subRepo;
    private final ServiceItemRepository itemRepo;
    private final ServiceRequestRepository reqRepo;

    public CatalogService(ServiceTypeRepository typeRepo,
                          CategoryRepository catRepo,
                          SubcategoryRepository subRepo,
                          ServiceItemRepository itemRepo,
                          ServiceRequestRepository reqRepo) {
        this.typeRepo = typeRepo;
        this.catRepo = catRepo;
        this.subRepo = subRepo;
        this.itemRepo = itemRepo;
        this.reqRepo = reqRepo;
    }

    // ── Service Types ──────────────────────────────────────────────
    public List<CatalogDtos.ServiceTypeResponse> getAllTypes() {
        return typeRepo.findAll().stream().map(this::toTypeResponse).collect(Collectors.toList());
    }

    public CatalogDtos.ServiceTypeResponse createType(CatalogDtos.ServiceTypeRequest req) {
        ServiceType t = new ServiceType();
        t.setName(req.getName());
        return toTypeResponse(typeRepo.save(t));
    }

    public CatalogDtos.ServiceTypeResponse updateType(Long id, CatalogDtos.ServiceTypeRequest req) {
        ServiceType t = typeRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        t.setName(req.getName());
        return toTypeResponse(typeRepo.save(t));
    }

    @Transactional
    public void deleteType(Long id) {

        if (catRepo.existsByServiceType_Id(id)) {
            throw new DeleteNotAllowedException(
                "Cannot delete Service Type. Delete all categories, subcategories and services under it first."
            );
        }

        typeRepo.deleteById(id);
    }

    // ── Categories ──────────────────────────────────────────────
    public List<CatalogDtos.CategoryResponse> getAllCategories() {
        return catRepo.findAll().stream().map(this::toCatResponse).collect(Collectors.toList());
    }

    public List<CatalogDtos.CategoryResponse> getCategoriesByType(Long typeId) {
        return catRepo.findByServiceType_Id(typeId).stream().map(this::toCatResponse).collect(Collectors.toList());
    }

    public CatalogDtos.CategoryResponse createCategory(CatalogDtos.CategoryRequest req) {
        ServiceType type = typeRepo.findById(req.getServiceTypeId())
                .orElseThrow(() -> new RuntimeException("Service type not found"));
        Category c = new Category();
        c.setName(req.getName());
        c.setServiceType(type);
        return toCatResponse(catRepo.save(c));
    }

    public CatalogDtos.CategoryResponse updateCategory(Long id, CatalogDtos.CategoryRequest req) {
        Category c = catRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        c.setName(req.getName());
        if (req.getServiceTypeId() != null) {
            ServiceType type = typeRepo.findById(req.getServiceTypeId())
                    .orElseThrow(() -> new RuntimeException("Service type not found"));
            c.setServiceType(type);
        }
        return toCatResponse(catRepo.save(c));
    }

    public void deleteCategory(Long id) {
        catRepo.deleteById(id);
    }

    // ── Subcategories ──────────────────────────────────────────────
    public List<CatalogDtos.SubcategoryResponse> getSubcategoriesByCategory(Long catId) {
        return subRepo.findByCategory_Id(catId).stream().map(this::toSubResponse).collect(Collectors.toList());
    }

    public CatalogDtos.SubcategoryResponse createSubcategory(CatalogDtos.SubcategoryRequest req) {
        Category cat = catRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Subcategory s = new Subcategory();
        s.setName(req.getName());
        s.setCategory(cat);
        return toSubResponse(subRepo.save(s));
    }

    public CatalogDtos.SubcategoryResponse updateSubcategory(Long id, CatalogDtos.SubcategoryRequest req) {
        Subcategory s = subRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        s.setName(req.getName());
        if (req.getCategoryId() != null) {
            Category cat = catRepo.findById(req.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            s.setCategory(cat);
        }
        return toSubResponse(subRepo.save(s));
    }

    public void deleteSubcategory(Long id) {
        subRepo.deleteById(id);
    }

    // ── Services/Items ──────────────────────────────────────────────
    public List<CatalogDtos.ServiceItemResponse> getAllServices() {
        return itemRepo.findAll().stream().map(this::toItemResponse).collect(Collectors.toList());
    }

    public List<CatalogDtos.ServiceItemResponse> getServicesBySubcategory(Long subId) {
        return itemRepo.findBySubcategory_Id(subId).stream().map(this::toItemResponse).collect(Collectors.toList());
    }

    public List<CatalogDtos.ServiceItemResponse> getServicesByCategory(Long catId) {
        return itemRepo.findByCategory_Id(catId).stream().map(this::toItemResponse).collect(Collectors.toList());
    }

    public CatalogDtos.ServiceItemResponse getServiceById(Long id) {
        return toItemResponse(itemRepo.findById(id).orElseThrow(() -> new RuntimeException("Service not found")));
    }

    public CatalogDtos.ServiceItemResponse createService(CatalogDtos.ServiceItemRequest req) {
        Category cat = catRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Subcategory sub = subRepo.findById(req.getSubcategoryId())
                .orElseThrow(() -> new RuntimeException("Subcategory not found"));

        com.sez.catalog.entity.Service s = new com.sez.catalog.entity.Service();
        s.setName(req.getName());
        s.setDescription(req.getDescription());
        s.setCategory(cat);
        s.setSubcategory(sub);
        s.setSlaHours(req.getSlaHours());
        s.setRequiresApproval(req.isRequiresApproval());
        s.setApprovalRole(req.getApprovalRole());
        s.setAccessDateRequired(req.isAccessDateRequired());
        return toItemResponse(itemRepo.save(s));
    }

    public CatalogDtos.ServiceItemResponse updateService(Long id, CatalogDtos.ServiceItemRequest req) {
        com.sez.catalog.entity.Service s = itemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        s.setName(req.getName());
        s.setDescription(req.getDescription());
        s.setSlaHours(req.getSlaHours());
        s.setRequiresApproval(req.isRequiresApproval());
        s.setApprovalRole(req.getApprovalRole());
        s.setAccessDateRequired(req.isAccessDateRequired());

        if (req.getCategoryId() != null) {
            Category cat = catRepo.findById(req.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            s.setCategory(cat);
        }
        if (req.getSubcategoryId() != null) {
            Subcategory sub = subRepo.findById(req.getSubcategoryId())
                    .orElseThrow(() -> new RuntimeException("Subcategory not found"));
            s.setSubcategory(sub);
        }
        return toItemResponse(itemRepo.save(s));
    }

    public void deleteService(Long id) {
        itemRepo.deleteById(id);
    }

    // ── Requests ──────────────────────────────────────────────
    public CatalogDtos.ServiceRequestResponse submitRequest(CatalogDtos.SubmitRequestBody body) {
        com.sez.catalog.entity.Service svc = itemRepo.findById(body.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        ServiceRequest req = new ServiceRequest();
        req.setService(svc);
        req.setRequestedBy(body.getRequestedBy() != null ? body.getRequestedBy() : 1L);
        req.setNotes(body.getNotes());
        req.setStatus(body.getStatus() != null ? body.getStatus() : "SUBMITTED");
        return toReqResponse(reqRepo.save(req));
    }

    public List<CatalogDtos.ServiceRequestResponse> getAllRequests() {
        return reqRepo.findAll().stream().map(this::toReqResponse).collect(Collectors.toList());
    }

    public CatalogDtos.ServiceRequestResponse getRequestById(Long id) {
        return toReqResponse(reqRepo.findById(id).orElseThrow(() -> new RuntimeException("Request not found")));
    }

    @Transactional
    public CatalogDtos.ServiceRequestResponse patchRequest(Long id, CatalogDtos.PatchRequestBody body) {
        ServiceRequest req = reqRepo.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        if (body.getStatus() != null) req.setStatus(body.getStatus());
        if (body.getCancellationReason() != null) req.setCancellationReason(body.getCancellationReason());
        return toReqResponse(reqRepo.save(req));
    }

    // ── Manager: Catalog Tree ──────────────────────────────────────────────
    public List<CatalogDtos.CatalogTreeNode> getCatalogTree() {
        return typeRepo.findAll().stream().map(type -> {
            CatalogDtos.CatalogTreeNode node = new CatalogDtos.CatalogTreeNode();
            node.setId(type.getId());
            node.setName(type.getName());

            List<CatalogDtos.CategoryTreeNode> catNodes = catRepo.findByServiceType_Id(type.getId()).stream().map(cat -> {
                CatalogDtos.CategoryTreeNode catNode = new CatalogDtos.CategoryTreeNode();
                catNode.setId(cat.getId());
                catNode.setName(cat.getName());

                List<CatalogDtos.SubcategoryTreeNode> subNodes = subRepo.findByCategory_Id(cat.getId()).stream().map(sub -> {
                    CatalogDtos.SubcategoryTreeNode subNode = new CatalogDtos.SubcategoryTreeNode();
                    subNode.setId(sub.getId());
                    subNode.setName(sub.getName());
                    subNode.setItems(itemRepo.findBySubcategory_Id(sub.getId()).stream()
                            .map(this::toItemResponse).collect(Collectors.toList()));
                    return subNode;
                }).collect(Collectors.toList());

                catNode.setSubcategories(subNodes);
                return catNode;
            }).collect(Collectors.toList());

            node.setCategories(catNodes);
            return node;
        }).collect(Collectors.toList());
    }

    // ── Mappers ──────────────────────────────────────────────
    private CatalogDtos.ServiceTypeResponse toTypeResponse(ServiceType t) {
        CatalogDtos.ServiceTypeResponse r = new CatalogDtos.ServiceTypeResponse();
        r.setId(t.getId());
        r.setName(t.getName());
        return r;
    }

    private CatalogDtos.CategoryResponse toCatResponse(Category c) {
        CatalogDtos.CategoryResponse r = new CatalogDtos.CategoryResponse();
        r.setId(c.getId());
        r.setName(c.getName());
        r.setServiceTypeId(c.getServiceTypeId());
        return r;
    }

    private CatalogDtos.SubcategoryResponse toSubResponse(Subcategory s) {
        CatalogDtos.SubcategoryResponse r = new CatalogDtos.SubcategoryResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setCategoryId(s.getCategoryId());
        return r;
    }

    private CatalogDtos.ServiceItemResponse toItemResponse(com.sez.catalog.entity.Service s) {
        CatalogDtos.ServiceItemResponse r = new CatalogDtos.ServiceItemResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setDescription(s.getDescription());
        r.setCategoryId(s.getCategoryId());
        r.setSubcategoryId(s.getSubcategoryId());
        r.setSlaHours(s.getSlaHours());
        r.setRequiresApproval(s.isRequiresApproval());
        r.setApprovalRole(s.getApprovalRole());
        r.setAccessDateRequired(s.isAccessDateRequired());
        return r;
    }

    private CatalogDtos.ServiceRequestResponse toReqResponse(ServiceRequest req) {
        CatalogDtos.ServiceRequestResponse r = new CatalogDtos.ServiceRequestResponse();
        r.setId(req.getId());
        r.setServiceId(req.getService().getId());
        r.setServiceName(req.getService().getName());
        r.setRequestedBy(req.getRequestedBy());
        r.setStatus(req.getStatus());
        r.setNotes(req.getNotes());
        r.setCancellationReason(req.getCancellationReason());
        r.setCreatedAt(req.getCreatedAt());
        r.setUpdatedAt(req.getUpdatedAt());
        return r;
    }
}
