package com.serviceeverz.userservice.usermanagement.dto;
 
import com.serviceeverz.userservice.shared.enums.*;
import com.serviceeverz.userservice.usermanagement.entity.User;
import java.time.LocalDateTime;
 
public class UserResponse {
    public Long id;
    public Long employeeId;
    public String firstName;
    public String lastName;
    public String fullName;
    public String email;
 
    public Long departmentId;
    public String departmentName;
 
    public Long designationId;
    public String designationName;
 
    public UserStatus status;
    public boolean firstLogin;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public Long locationId;
    public String locationName;
 
    // ── NEW: manager info ─────────────────────────────────────────────────────
    public Long managerId;
 
    public static UserResponse fromUser(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.employeeId = u.getEmployeeId();
         String firstName = u.getFirstName() != null ? u.getFirstName() : "";
         String lastName = u.getLastName() != null ? u.getLastName() : "";
 
         r.firstName = firstName;
         r.lastName = lastName;
         r.fullName = (firstName + " " + lastName).trim();
        r.email = u.getEmail();
        r.departmentId = u.getDepartment() != null ? u.getDepartment().getId() : null;
        r.departmentName = u.getDepartment() != null ? u.getDepartment().getName() : null;
        r.designationId = u.getDesignation() != null ? u.getDesignation().getId() : null;
        r.designationName = u.getDesignation() != null ? u.getDesignation().getName() : null;
        r.locationId = u.getLocation() != null ? u.getLocation().getId() : null;
        r.locationName = u.getLocation() != null ? u.getLocation().getName() : null;
        r.status = u.getStatus();
        r.firstLogin = u.isFirstLogin();
        r.createdAt = u.getCreatedAt();
        r.updatedAt = u.getUpdatedAt();
        r.managerId = u.getManagerId();  // ── NEW
        return r;
    }
}
 