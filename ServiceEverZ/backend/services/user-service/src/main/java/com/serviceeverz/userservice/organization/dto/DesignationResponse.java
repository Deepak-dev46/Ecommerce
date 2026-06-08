package com.serviceeverz.userservice.organization.dto;
 
import com.serviceeverz.userservice.organization.entity.DesignationEntity;
 
public class DesignationResponse {
    private Long id;
    private String name;
    private Long departmentId;
    private String departmentName;
    private boolean active;
 
    public static DesignationResponse from(DesignationEntity d) {
        DesignationResponse r = new DesignationResponse();
        r.id = d.getId();
        r.name = d.getName();
        r.departmentId = d.getDepartment().getId();
        r.departmentName = d.getDepartment().getName();
        r.active = d.isActive();
        return r;
    }
 
    public Long getId() { return id; }
    public String getName() { return name; }
    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public boolean isActive() { return active; }
}
 