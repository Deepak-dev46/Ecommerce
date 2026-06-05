package com.rvz.serviceeverz.knowledgebase.entity;
 
import jakarta.persistence.*;
 
@Entity
@Table(name = "kb_category")
public class KbCategory {
 
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String name;
    private String description;
    private Long parentId;
    @Column(nullable = false) private Boolean isActive;
 
    @PrePersist public void prePersist() { if (isActive == null) isActive = true; }
 
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
 