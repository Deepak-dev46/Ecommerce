package com.serviceeverz.userservice.usermanagement.entity;
 
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
 
import java.time.LocalDateTime;
 
@Entity
@Table(name = "password_history")
public class PasswordHistory {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false)
    private Long userId;
 
    @Column(nullable = false)
    private String passwordHash;
 
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
 
    public PasswordHistory() {
    }
 
    public PasswordHistory(Long userId, String passwordHash) {
        this.userId = userId;
        this.passwordHash = passwordHash;
    }
 
    public Long getId() {
        return id;
    }
 
    public Long getUserId() {
        return userId;
    }
 
    public String getPasswordHash() {
        return passwordHash;
    }
 
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
 