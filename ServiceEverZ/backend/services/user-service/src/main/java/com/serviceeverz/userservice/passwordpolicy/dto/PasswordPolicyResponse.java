package com.serviceeverz.userservice.passwordpolicy.dto;
 
import com.serviceeverz.userservice.passwordpolicy.entity.PasswordPolicy;
 
import java.time.LocalDateTime;
 
public class PasswordPolicyResponse {
 
    private Long id;
    private int minLength;
    private boolean requireUppercase;
    private boolean requireLowercase;
    private boolean requireDigit;
    private boolean requireSpecialChar;
    private int passwordExpiryDays;
    private int passwordHistoryCount;
    private int maxFailedAttempts;
    private int lockoutDurationMinutes;
    private LocalDateTime updatedAt;
 
    public static PasswordPolicyResponse from(PasswordPolicy p) {
        PasswordPolicyResponse r = new PasswordPolicyResponse();
        r.id = p.getId();
        r.minLength = p.getMinLength();
        r.requireUppercase = p.isRequireUppercase();
        r.requireLowercase = p.isRequireLowercase();
        r.requireDigit = p.isRequireDigit();
        r.requireSpecialChar = p.isRequireSpecialChar();
        r.passwordExpiryDays = p.getPasswordExpiryDays();
        r.passwordHistoryCount = p.getPasswordHistoryCount();
        r.maxFailedAttempts = p.getMaxFailedAttempts();
        r.lockoutDurationMinutes = p.getLockoutDurationMinutes();
        r.updatedAt = p.getUpdatedAt();
        return r;
    }
 
    public Long getId() {
        return id;
    }
 
    public int getMinLength() {
        return minLength;
    }
 
    public void setMinLength(int minLength) {
        this.minLength = minLength;
    }
 
    public boolean isRequireUppercase() {
        return requireUppercase;
    }
 
    public void setRequireUppercase(boolean requireUppercase) {
        this.requireUppercase = requireUppercase;
    }
 
    public boolean isRequireLowercase() {
        return requireLowercase;
    }
 
    public void setRequireLowercase(boolean requireLowercase) {
        this.requireLowercase = requireLowercase;
    }
 
    public boolean isRequireDigit() {
        return requireDigit;
    }
 
    public void setRequireDigit(boolean requireDigit) {
        this.requireDigit = requireDigit;
    }
 
    public boolean isRequireSpecialChar() {
        return requireSpecialChar;
    }
 
    public void setRequireSpecialChar(boolean requireSpecialChar) {
        this.requireSpecialChar = requireSpecialChar;
    }
 
    public int getPasswordExpiryDays() {
        return passwordExpiryDays;
    }
 
    public void setPasswordExpiryDays(int passwordExpiryDays) {
        this.passwordExpiryDays = passwordExpiryDays;
    }
 
    public int getPasswordHistoryCount() {
        return passwordHistoryCount;
    }
 
    public void setPasswordHistoryCount(int passwordHistoryCount) {
        this.passwordHistoryCount = passwordHistoryCount;
    }
 
    public int getMaxFailedAttempts() {
        return maxFailedAttempts;
    }
 
    public void setMaxFailedAttempts(int maxFailedAttempts) {
        this.maxFailedAttempts = maxFailedAttempts;
    }
 
    public int getLockoutDurationMinutes() {
        return lockoutDurationMinutes;
    }
 
    public void setLockoutDurationMinutes(int lockoutDurationMinutes) {
        this.lockoutDurationMinutes = lockoutDurationMinutes;
    }
 
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
 