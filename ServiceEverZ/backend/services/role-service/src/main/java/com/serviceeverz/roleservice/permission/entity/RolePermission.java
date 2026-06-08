package com.serviceeverz.roleservice.permission.entity;

import com.serviceeverz.roleservice.entity.Role;
import com.serviceeverz.roleservice.shared.enums.PermissionType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "role_permissions", uniqueConstraints = @UniqueConstraint(columnNames = {"role_id", "module", "feature", "permission_type"}))
public class RolePermission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    @Column(nullable = false)
    private String module;
    @Column(nullable = false)
    private String feature;
    @Column(nullable = false)
    private String permissionName;
    @Enumerated(EnumType.STRING)
    @Column(name = "permission_type", nullable = false)
    private PermissionType permissionType;
    @Column(nullable = false)
    private boolean granted = true;
    public String getModuleName() {
		return module;
	}
	public void setModuleName(String moduleName) {
		this.module = moduleName;
	}
	public String getPermissionName() {
		return permissionName;
	}
	public void setPermissionName(String permissionName) {
		this.permissionName = permissionName;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public RolePermission() {}
    public RolePermission(Role role, String module, String feature, PermissionType permissionType, boolean granted) { this.role = role; this.module = module; this.feature = feature; this.permissionType = permissionType; this.granted = granted; }
    public Long getId() { return id; }
    public Role getRole() { return role; }
    public void setRole(Role v) { this.role = v; }
    public String getModule() { return module; }
    public void setModule(String v) { this.module = v; }
    public String getFeature() { return feature; }
    public void setFeature(String v) { this.feature = v; }
    public PermissionType getPermissionType() { return permissionType; }
    public void setPermissionType(PermissionType v) { this.permissionType = v; }
    public boolean isGranted() { return granted; }
    public void setGranted(boolean v) { this.granted = v; }
}
