package com.serviceeverz.userservice.organization.dto;
 
import com.serviceeverz.userservice.organization.entity.DepartmentEntity;
 
public class DepartmentResponse {
    private Long id;
    private String name;
    private boolean active;
 
    public static DepartmentResponse from(DepartmentEntity d) {
        DepartmentResponse r = new DepartmentResponse();
        r.id = d.getId();
        r.name = d.getName();
        r.active = d.isActive();
        return r;
    }
 
    public Long getId() { return id; }
    public String getName() { return name; }
    public boolean isActive() { return active; }
}
 