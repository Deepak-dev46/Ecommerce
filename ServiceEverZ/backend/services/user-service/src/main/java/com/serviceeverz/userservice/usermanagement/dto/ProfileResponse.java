package com.serviceeverz.userservice.usermanagement.dto;
 
import com.serviceeverz.userservice.usermanagement.entity.User;
 
public class ProfileResponse {
 
    private Long   id;
    private Long   employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private String profilePicture;
    private boolean firstLogin;
    private String status;
 
    // ✅ FIXED: was "Department department" (enum) — now proper strings
    private String departmentName;
    private String designationName;
 
    private String createdAt;
    private String passwordChangedAt;
 
    public static ProfileResponse from(User user) {
        ProfileResponse r = new ProfileResponse();
 
        r.id             = user.getId();
        r.employeeId     = user.getEmployeeId();
        r.firstName      = user.getFirstName();
        r.lastName       = user.getLastName();
        r.email          = user.getEmail();
        r.mobile         = user.getMobile();
        r.profilePicture = user.getProfilePicture();
        r.firstLogin     = user.isFirstLogin();
        r.createdAt      = user.getCreatedAt() != null ? user.getCreatedAt().toString() : null;
        r.passwordChangedAt = user.getPasswordChangedAt() != null
                ? user.getPasswordChangedAt().toString() : null;
 
        // ✅ Map department name from entity
        if (user.getDepartment() != null) {
            r.departmentName = user.getDepartment().getName();
        }
 
        // ✅ Map designation name from entity
        if (user.getDesignation() != null) {
            r.designationName = user.getDesignation().getName();
        }
 
        try {
            if (user.getStatus() != null) {
                r.status = user.getStatus().toString();
            }
        } catch (Exception ignored) {}
 
        return r;
    }
 
    // Getters
    public Long    getId()              { return id; }
    public Long    getEmployeeId()      { return employeeId; }
    public String  getFirstName()       { return firstName; }
    public String  getLastName()        { return lastName; }
    public String  getEmail()           { return email; }
    public String  getMobile()          { return mobile; }
    public String  getProfilePicture()  { return profilePicture; }
    public boolean isFirstLogin()       { return firstLogin; }
    public String  getStatus()          { return status; }
    public String  getDepartmentName()  { return departmentName; }
    public String  getDesignationName() { return designationName; }
    public String  getCreatedAt()       { return createdAt; }
    public String  getPasswordChangedAt(){ return passwordChangedAt; }
}
 