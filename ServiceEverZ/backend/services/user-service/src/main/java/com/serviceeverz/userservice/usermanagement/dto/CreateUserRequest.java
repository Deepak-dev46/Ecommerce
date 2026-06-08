package com.serviceeverz.userservice.usermanagement.dto;
 
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
 
public class CreateUserRequest {
 
    @NotBlank
    private String firstName;
 
    @NotBlank
    private String lastName;
 
    @NotBlank
    @Email
    private String email;
 
    @NotNull
    private Long departmentId;
 
    @NotNull
    private Long designationId;
 
    private Long locationId;
 
    // ── NEW: optional manager assignment (for END_USER) ───────────────────────
    // managerId must be a user who holds ITSM_MANAGER, APPROVAL_MANAGER_L1,
    // APPROVAL_MANAGER_L2, or RESOURCE_OWNER role
    private Long managerId;
 
    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }
 
    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }
 
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
 
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
 
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
 
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
 
    public Long getDesignationId() { return designationId; }
    public void setDesignationId(Long designationId) { this.designationId = designationId; }
}
 