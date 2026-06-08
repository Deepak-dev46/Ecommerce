package com.rvz.masterdataservice.service;

import com.rvz.masterdataservice.config.MasterDataMapper;
import com.rvz.masterdataservice.dto.response.*;
import com.rvz.masterdataservice.entity.*;
import com.rvz.masterdataservice.exception.ResourceNotFoundException;
import com.rvz.masterdataservice.repository.*;
import com.rvz.masterdataservice.service.impl.MasterDataServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MasterDataServiceImplTest {

    @Mock private ServiceTypeRepository serviceTypeRepository;
    @Mock private ServiceCategoryRepository serviceCategoryRepository;
    @Mock private ServiceSubcategoryRepository serviceSubcategoryRepository;
    @Mock private ServiceItemRepository serviceItemRepository;
    @Mock private PrioritySlaRepository prioritySlaRepository;
    @Mock private ComplexityEffortRepository complexityEffortRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private ProjectAssignmentRepository projectAssignmentRepository;
    @Mock private MasterDataMapper mapper;

    @InjectMocks
    private MasterDataServiceImpl service;

    private ServiceType serviceType;
    private ServiceTypeResponse serviceTypeResponse;
    private ServiceItem serviceItem;
    private ServiceItemResponse serviceItemResponse;
    private Project project;
    private ProjectResponse projectResponse;

    @BeforeEach
    void setUp() {
        serviceType = new ServiceType();
        serviceType.setTypeId(1);
        serviceType.setTypeName("IT");

        serviceTypeResponse = new ServiceTypeResponse();
        serviceTypeResponse.setTypeId(1);
        serviceTypeResponse.setTypeName("IT");

        serviceItem = new ServiceItem();
        serviceItem.setServiceId(1);
        serviceItem.setServiceName("Git Access");
        serviceItem.setStatus("ACTIVE");

        serviceItemResponse = new ServiceItemResponse();
        serviceItemResponse.setServiceId(1);
        serviceItemResponse.setServiceName("Git Access");

        project = new Project();
        project.setId(1L);
        project.setProjectCode("PRJ-001");
        project.setName("ITSM Project");

        projectResponse = new ProjectResponse();
        projectResponse.setId(1L);
        projectResponse.setProjectCode("PRJ-001");
    }

    @Test
    void getAllServiceTypes_returnsListSuccessfully() {
        when(serviceTypeRepository.findAll()).thenReturn(List.of(serviceType));
        when(mapper.toServiceTypeResponse(serviceType)).thenReturn(serviceTypeResponse);

        List<ServiceTypeResponse> result = service.getAllServiceTypes();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("IT", result.get(0).getTypeName());
        verify(serviceTypeRepository).findAll();
    }

    @Test
    void getAllServiceTypes_returnsEmptyList() {
        when(serviceTypeRepository.findAll()).thenReturn(Collections.emptyList());

        List<ServiceTypeResponse> result = service.getAllServiceTypes();

        assertTrue(result.isEmpty());
    }

    @Test
    void getCategoriesByTypeId_returnsListSuccessfully() {
        ServiceCategory category = new ServiceCategory();
        category.setCategoryId(1);
        ServiceCategoryResponse categoryResponse = new ServiceCategoryResponse();
        categoryResponse.setCategoryId(1);

        when(serviceCategoryRepository.findByServiceType_TypeId(1)).thenReturn(List.of(category));
        when(mapper.toServiceCategoryResponse(category)).thenReturn(categoryResponse);

        List<ServiceCategoryResponse> result = service.getCategoriesByTypeId(1);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getSubcategoriesByCategoryId_returnsListSuccessfully() {
        ServiceSubcategory sub = new ServiceSubcategory();
        sub.setSubcategoryId(1);
        ServiceSubcategoryResponse subResponse = new ServiceSubcategoryResponse();
        subResponse.setSubcategoryId(1);

        when(serviceSubcategoryRepository.findByServiceCategory_CategoryId(1)).thenReturn(List.of(sub));
        when(mapper.toServiceSubcategoryResponse(sub)).thenReturn(subResponse);

        List<ServiceSubcategoryResponse> result = service.getSubcategoriesByCategoryId(1);

        assertFalse(result.isEmpty());
    }

    @Test
    void getItemsBySubcategoryId_returnsListSuccessfully() {
        when(serviceItemRepository.findByServiceSubcategory_SubcategoryId(1)).thenReturn(List.of(serviceItem));
        when(mapper.toServiceItemResponse(serviceItem)).thenReturn(serviceItemResponse);

        List<ServiceItemResponse> result = service.getItemsBySubcategoryId(1);

        assertFalse(result.isEmpty());
        assertEquals("Git Access", result.get(0).getServiceName());
    }

    @Test
    void getItemById_returnsItemSuccessfully() {
        when(serviceItemRepository.findById(1)).thenReturn(Optional.of(serviceItem));
        when(mapper.toServiceItemResponse(serviceItem)).thenReturn(serviceItemResponse);

        ServiceItemResponse result = service.getItemById(1);

        assertNotNull(result);
        assertEquals(1, result.getServiceId());
    }

    @Test
    void getItemById_throwsResourceNotFoundException() {
        when(serviceItemRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getItemById(99));
    }

    @Test
    void getAllActiveItems_returnsActiveItems() {
        when(serviceItemRepository.findByStatus("ACTIVE")).thenReturn(List.of(serviceItem));
        when(mapper.toServiceItemResponse(serviceItem)).thenReturn(serviceItemResponse);

        List<ServiceItemResponse> result = service.getAllActiveItems();

        assertFalse(result.isEmpty());
    }

    @Test
    void getAllPrioritySla_returnsListSuccessfully() {
        PrioritySla sla = new PrioritySla();
        sla.setPriorityId(1);
        PrioritySlaResponse slaResponse = new PrioritySlaResponse();
        slaResponse.setPriorityId(1);

        when(prioritySlaRepository.findAll()).thenReturn(List.of(sla));
        when(mapper.toPrioritySlaResponse(sla)).thenReturn(slaResponse);

        List<PrioritySlaResponse> result = service.getAllPrioritySla();

        assertFalse(result.isEmpty());
    }

    @Test
    void getAllComplexityEffort_returnsListSuccessfully() {
        ComplexityEffort ce = new ComplexityEffort();
        ce.setComplexityId(1);
        ComplexityEffortResponse ceResponse = new ComplexityEffortResponse();
        ceResponse.setComplexityId(1);

        when(complexityEffortRepository.findAll()).thenReturn(List.of(ce));
        when(mapper.toComplexityEffortResponse(ce)).thenReturn(ceResponse);

        List<ComplexityEffortResponse> result = service.getAllComplexityEffort();

        assertFalse(result.isEmpty());
    }

    @Test
    void getAllProjects_returnsListSuccessfully() {
        when(projectRepository.findAll()).thenReturn(List.of(project));
        when(mapper.toProjectResponse(project)).thenReturn(projectResponse);

        List<ProjectResponse> result = service.getAllProjects();

        assertFalse(result.isEmpty());
        assertEquals("PRJ-001", result.get(0).getProjectCode());
    }

    @Test
    void getProjectById_returnsProjectSuccessfully() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(mapper.toProjectResponse(project)).thenReturn(projectResponse);

        ProjectResponse result = service.getProjectById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getProjectById_throwsResourceNotFoundException() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getProjectById(99L));
    }

    @Test
    void getAssignmentsByUserId_returnsListSuccessfully() {
        ProjectAssignment pa = new ProjectAssignment();
        pa.setId(1L);
        pa.setUserId(1L);
        ProjectAssignmentResponse paResponse = new ProjectAssignmentResponse();
        paResponse.setId(1L);

        when(projectAssignmentRepository.findByUserId(1L)).thenReturn(List.of(pa));
        when(mapper.toProjectAssignmentResponse(pa)).thenReturn(paResponse);

        List<ProjectAssignmentResponse> result = service.getAssignmentsByUserId(1L);

        assertFalse(result.isEmpty());
    }

    @Test
    void getAssignmentsByProjectId_returnsListSuccessfully() {
        ProjectAssignment pa = new ProjectAssignment();
        pa.setId(1L);
        pa.setProjectId(1L);
        ProjectAssignmentResponse paResponse = new ProjectAssignmentResponse();
        paResponse.setId(1L);

        when(projectAssignmentRepository.findByProjectId(1L)).thenReturn(List.of(pa));
        when(mapper.toProjectAssignmentResponse(pa)).thenReturn(paResponse);

        List<ProjectAssignmentResponse> result = service.getAssignmentsByProjectId(1L);

        assertFalse(result.isEmpty());
    }
}
