package com.serviceeverz.authservice.entity;
 
import jakarta.persistence.*;
 
import java.time.LocalDateTime;
 
@Entity
@Table(name = "password_reset_otp")
public class PasswordResetOtp {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false)
    private String email;
 
    @Column(nullable = false, length = 6)
    private String otp;
 
    @Column(nullable = false)
    private LocalDateTime expiryTime;
 
    @Column(nullable = false)
    private boolean verified = false;
 
    @Column(nullable = false)
    private int attempts = 0;
 
    @Column(nullable = false)
    private boolean consumed = false;
 
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
 
    public PasswordResetOtp() {
    }
 
    public PasswordResetOtp(String email, String otp, LocalDateTime expiryTime) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.verified = false;
        this.attempts = 0;
        this.consumed = false;
        this.createdAt = LocalDateTime.now();
    }
 
    public Long getId() {
        return id;
    }
 
    public String getEmail() {
        return email;
    }
 
    public String getOtp() {
        return otp;
    }
 
    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }
 
    public boolean isVerified() {
        return verified;
    }
 
    public void setVerified(boolean verified) {
        this.verified = verified;
    }
 
    public int getAttempts() {
        return attempts;
    }
 
    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }
 
    public boolean isConsumed() {
        return consumed;
    }
 
    public void setConsumed(boolean consumed) {
        this.consumed = consumed;
    }
 
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
 