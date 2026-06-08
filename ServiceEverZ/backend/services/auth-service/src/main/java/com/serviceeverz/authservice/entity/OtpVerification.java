package com.serviceeverz.authservice.entity;



import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String otp;

    private LocalDateTime expiryTime;
    private boolean verified;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
     
    public LocalDateTime getCreatedAt() { return createdAt; }
     

    public OtpVerification() {}

    public OtpVerification(String email, String otp, LocalDateTime expiryTime, boolean verified) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.verified = verified;
        this.createdAt=LocalDateTime.now();
    }

    public String getEmail() { return email; }
    public String getOtp() { return otp; }
    public LocalDateTime getExpiryTime() { return expiryTime; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean v) { this.verified = v; }
}