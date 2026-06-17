package com.serviceeverz.rmoservice.client.dto;
 
import java.time.LocalDateTime;
 
public class UserResponse {
    public Long id;
    public Long employeeId;
    public String firstName;
    public String lastName;
    public String fullName;        // ✅ added
    public String email;
    public Long departmentId;
    public String departmentName;
    public Long designationId;
    public String designationName;
    public String status;          // ✅ String not enum — avoids mismatch
    public boolean firstLogin;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public Long locationId;        // ✅ added
    public String locationName;    // ✅ added
 
    // Getters
    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public Long getDesignationId() { return designationId; }
    public String getDesignationName() { return designationName; }
    public String getStatus() { return status; }
    public boolean isFirstLogin() { return firstLogin; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Long getLocationId() { return locationId; }
    public String getLocationName() { return locationName; }
}
 