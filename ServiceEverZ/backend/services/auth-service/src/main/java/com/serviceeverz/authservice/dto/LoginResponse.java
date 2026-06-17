// FILE: auth-service/src/main/java/com/serviceeverz/authservice/dto/LoginResponse.java
package com.serviceeverz.authservice.dto;
 
import java.util.List;
 
public class LoginResponse {
 
    private String token;
    private String tokenType;
    private long expiresIn;
    private Long userId;
    private String email;
    private String fullName;
    private List<String> roles;
 
    // ── NEW: project-derived effective roles ─────────────────────────────────
    // These are computed at login time from the user's project assignments.
    // An END_USER who is l1ManagerId on project A gets "APPROVAL_MANAGER_L1" here.
    // An END_USER who is resourceOwnerId on project B gets "RESOURCE_OWNER" here.
    // Frontend sidebar uses these to show additional nav sections.
    private List<String> effectiveRoles;
 
    private boolean firstLogin;
    private boolean passwordExpired;
    private String message;
    private boolean requiresOtp;
 
    public LoginResponse() {}
 
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public List<String> getEffectiveRoles() { return effectiveRoles; }
    public void setEffectiveRoles(List<String> effectiveRoles) { this.effectiveRoles = effectiveRoles; }
    public boolean isFirstLogin() { return firstLogin; }
    public void setFirstLogin(boolean firstLogin) { this.firstLogin = firstLogin; }
    public boolean isPasswordExpired() { return passwordExpired; }
    public void setPasswordExpired(boolean passwordExpired) { this.passwordExpired = passwordExpired; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isRequiresOtp() { return requiresOtp; }
    public void setRequiresOtp(boolean requiresOtp) { this.requiresOtp = requiresOtp; }
}
 