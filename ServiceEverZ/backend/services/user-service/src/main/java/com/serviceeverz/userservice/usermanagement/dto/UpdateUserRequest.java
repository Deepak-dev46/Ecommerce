package com.serviceeverz.userservice.usermanagement.dto;
 
import com.serviceeverz.userservice.shared.enums.UserStatus;
 
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private Long departmentId;
    private Long designationId;
    private String email;
    private UserStatus status;
    private Long locationId;
 
    // ── NEW ───────────────────────────────────────────────────────────────────
    private Long managerId;
 
    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }
 
    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }
 
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
 
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
 
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
 
    public Long getDesignationId() { return designationId; }
    public void setDesignationId(Long designationId) { this.designationId = designationId; }
 
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
 
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
}
 