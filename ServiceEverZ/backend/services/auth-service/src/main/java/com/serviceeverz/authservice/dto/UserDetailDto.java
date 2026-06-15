package com.serviceeverz.authservice.dto;
 
import java.time.LocalDateTime;
 
public class UserDetailDto {
 
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String passwordHash;
    private String status;
    private boolean firstLogin;
    private int failedAttempts;
    private boolean accountLocked;
    private LocalDateTime passwordChangedAt;
 
    public UserDetailDto() {
    }
 
    public Long getId() {
        return id;
    }
 
    public void setId(Long id) {
        this.id = id;
    }
 
    public String getEmail() {
        return email;
    }
 
    public int getFailedAttempts() {
        return failedAttempts;
    }
 
    public void setFailedAttempts(int failedAttempts) {
        this.failedAttempts = failedAttempts;
    }
 
    public boolean isAccountLocked() {
        return accountLocked;
    }
 
    public void setAccountLocked(boolean accountLocked) {
        this.accountLocked = accountLocked;
    }
 
    public void setEmail(String email) {
        this.email = email;
    }
 
    public String getFirstName() {
        return firstName;
    }
 
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
 
    public String getLastName() {
        return lastName;
    }
 
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
 
    public String getPasswordHash() {
        return passwordHash;
    }
 
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
 
    public String getStatus() {
        return status;
    }
 
    public void setStatus(String status) {
        this.status = status;
    }
 
    public boolean isFirstLogin() {
        return firstLogin;
    }
 
    public void setFirstLogin(boolean firstLogin) {
        this.firstLogin = firstLogin;
    }
 
    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }
 
    public void setPasswordChangedAt(LocalDateTime passwordChangedAt) {
        this.passwordChangedAt = passwordChangedAt;
    }
}
 