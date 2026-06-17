package com.serviceeverz.userservice.organization.service;
 
import com.serviceeverz.userservice.organization.dto.*;
import com.serviceeverz.userservice.organization.entity.DepartmentEntity;
import com.serviceeverz.userservice.organization.entity.DesignationEntity;
import com.serviceeverz.userservice.organization.repository.DepartmentRepository;
import com.serviceeverz.userservice.organization.repository.DesignationRepository;
import com.serviceeverz.userservice.shared.exception.BusinessException;
import com.serviceeverz.userservice.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.stream.Collectors;
 
@Service
public class OrganizationServiceImpl implements IOrganizationService {
 
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
 
    public OrganizationServiceImpl(DepartmentRepository departmentRepository,
                                   DesignationRepository designationRepository) {
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
    }
 
    @Override
    public DepartmentResponse createDepartment(DepartmentRequest req, Long adminId) {
        if (departmentRepository.existsByNameIgnoreCase(req.getName())) {
            throw new BusinessException("Department already exists: " + req.getName());
        }
 
        DepartmentEntity d = new DepartmentEntity();
        d.setName(req.getName().trim());
        d.setCreatedBy(adminId);
        return DepartmentResponse.from(departmentRepository.save(d));
    }
 
    @Override
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(DepartmentResponse::from)
                .collect(Collectors.toList());
    }
 
    @Override
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest req) {
        DepartmentEntity d = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
 
        d.setName(req.getName().trim());
        return DepartmentResponse.from(departmentRepository.save(d));
    }
 
    @Override
    public void disableDepartment(Long id) {
        DepartmentEntity d = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        d.setActive(false);
        departmentRepository.save(d);
    }
 
    @Override
    public DesignationResponse createDesignation(DesignationRequest req, Long adminId) {
        DepartmentEntity department = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
 
        if (!department.isActive()) {
            throw new BusinessException("Cannot add designation to inactive department");
        }
 
        if (designationRepository.existsByNameIgnoreCaseAndDepartmentId(req.getName(), req.getDepartmentId())) {
            throw new BusinessException("Designation already exists in this department: " + req.getName());
        }
 
        DesignationEntity d = new DesignationEntity();
        d.setName(req.getName().trim());
        d.setDepartment(department);
        d.setCreatedBy(adminId);
 
        return DesignationResponse.from(designationRepository.save(d));
    }
 
    @Override
    public List<DesignationResponse> getAllDesignations() {
        return designationRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(DesignationResponse::from)
                .collect(Collectors.toList());
    }
 
    @Override
    public List<DesignationResponse> getDesignationsByDepartment(Long departmentId) {
        return designationRepository.findByDepartmentIdAndActiveTrueOrderByNameAsc(departmentId)
                .stream()
                .map(DesignationResponse::from)
                .collect(Collectors.toList());
    }
 
    @Override
    public DesignationResponse updateDesignation(Long id, DesignationRequest req) {
        DesignationEntity d = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
 
        DepartmentEntity department = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
 
        d.setName(req.getName().trim());
        d.setDepartment(department);
 
        return DesignationResponse.from(designationRepository.save(d));
    }
 
    @Override
    public void disableDesignation(Long id) {
        DesignationEntity d = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
        d.setActive(false);
        designationRepository.save(d);
    }
    @Override
    public void deleteDepartment(Long id) {
        DepartmentEntity dept = departmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        departmentRepository.delete(dept);
    }
     
    @Override
    public void deleteDesignation(Long id) {
        DesignationEntity desig = designationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Designation not found: " + id));
        designationRepository.delete(desig);
    }
     

 


}
 