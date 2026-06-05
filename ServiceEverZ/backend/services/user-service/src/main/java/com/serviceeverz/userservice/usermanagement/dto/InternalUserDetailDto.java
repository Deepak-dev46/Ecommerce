package com.serviceeverz.userservice.usermanagement.dto;
 
import com.serviceeverz.userservice.usermanagement.entity.User;
 
import java.time.LocalDateTime;
 
public class InternalUserDetailDto {
 
    private Long id;
    private String email;
    private String passwordHash;
    private String firstName;
    private String lastName;
    private String status;
    private boolean firstLogin;
    private int failedAttempts;
    private boolean accountLocked;
    private LocalDateTime passwordChangedAt;
 
    public static InternalUserDetailDto fromUser(User u) {
        InternalUserDetailDto d = new InternalUserDetailDto();
        d.id = u.getId();
        d.email = u.getEmail();
        d.passwordHash = u.getPasswordHash();
        d.firstName = u.getFirstName();
        d.lastName = u.getLastName();
        d.status = u.getStatus().name();
        d.firstLogin = u.isFirstLogin();
        d.failedAttempts = u.getFailedAttempts();
        d.accountLocked = u.isAccountLocked();
        d.passwordChangedAt = u.getPasswordChangedAt();
        return d;
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
 
    public void setEmail(String email) {
        this.email = email;
    }
 
    public String getPasswordHash() {
        return passwordHash;
    }
 
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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
 
    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }
 
    public void setPasswordChangedAt(LocalDateTime passwordChangedAt) {
        this.passwordChangedAt = passwordChangedAt;
    }
}
 