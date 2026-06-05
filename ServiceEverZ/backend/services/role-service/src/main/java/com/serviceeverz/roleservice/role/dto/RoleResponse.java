package com.serviceeverz.roleservice.role.dto;
 
import com.serviceeverz.roleservice.entity.Role;
import java.time.LocalDateTime;
 
public class RoleResponse {
    private Long id;
    private String name;          // was RoleName enum, now String
    private String description;
    private boolean active;
    private LocalDateTime createdAt;
 
    public static RoleResponse from(Role r) {
        RoleResponse res = new RoleResponse();
        res.id = r.getId();
        res.name = r.getName();   // String directly
        res.description = r.getDescription();
        res.active = r.isActive();
        res.createdAt = r.getCreatedAt();
        return res;
    }
 
    public Long getId()                 { return id; }
    public String getName()             { return name; }
    public String getDescription()      { return description; }
    public boolean isActive()           { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
 