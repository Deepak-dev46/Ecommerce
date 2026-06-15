package com.serviceeverz.userservice.organization.service;
 
import com.serviceeverz.userservice.organization.dto.*;
 
import java.util.List;
 
public interface IOrganizationService {
    DepartmentResponse createDepartment(DepartmentRequest req, Long adminId);
    List<DepartmentResponse> getAllDepartments();
    DepartmentResponse updateDepartment(Long id, DepartmentRequest req);
    void disableDepartment(Long id);
 
    DesignationResponse createDesignation(DesignationRequest req, Long adminId);
    List<DesignationResponse> getAllDesignations();
    List<DesignationResponse> getDesignationsByDepartment(Long departmentId);
    DesignationResponse updateDesignation(Long id, DesignationRequest req);
    void disableDesignation(Long id);
    void deleteDepartment(Long id);
void deleteDesignation(Long id);
 


}
 