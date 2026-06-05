package com.serviceeverz.userservice.organization.entity;
 
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
 
import java.time.LocalDateTime;
 
@Entity
@Table(name = "departments", uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
})
public class DepartmentEntity {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false, length = 100)
    private String name;
 
    @Column(nullable = false)
    private boolean active = true;
 
    @Column(nullable = false)
    private Long createdBy = 0L;
 
    @CreationTimestamp
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    private LocalDateTime updatedAt;
 
    public Long getId() { return id; }
    public String getName() { return name; }
    public boolean isActive() { return active; }
    public Long getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
 
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setActive(boolean active) { this.active = active; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}
 