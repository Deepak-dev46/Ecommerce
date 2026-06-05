package com.serviceeverz.roleservice.entity;
 
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "roles")
public class Role {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    // Previously: @Enumerated(EnumType.STRING) RoleName name
    // Now: plain String — any role name the admin creates
    @Column(name = "name", nullable = false, unique = true)
    private String name;
 
    @Column(name = "description")
    private String description;
 
    @Column(nullable = false)
    private boolean active = true;
 
    @CreationTimestamp
    private LocalDateTime createdAt;
 
    public Role() {}
 
    public Role(String name, String description) {
        this.name = name;
        this.description = description;
    }
 
    public Long getId()                         { return id; }
    public String getName()                     { return name; }
    public void setName(String name)            { this.name = name; }
    public String getDescription()              { return description; }
    public void setDescription(String desc)     { this.description = desc; }
    public boolean isActive()                   { return active; }
    public void setActive(boolean active)       { this.active = active; }
    public LocalDateTime getCreatedAt()         { return createdAt; }
}
 