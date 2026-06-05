package com.serviceeverz.userservice.organization.dto;
 
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
 
public class DesignationRequest {
    @NotBlank
    private String name;
 
    @NotNull
    private Long departmentId;
 
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
 
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
}
 