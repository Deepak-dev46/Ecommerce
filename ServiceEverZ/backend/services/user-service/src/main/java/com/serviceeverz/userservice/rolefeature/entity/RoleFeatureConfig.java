// FILE: user-service/src/main/java/com/serviceeverz/userservice/rolefeature/entity/RoleFeatureConfig.java
package com.serviceeverz.userservice.rolefeature.entity;
 
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
 
/**
 * Stores which features are enabled or disabled per role.
 * Admin toggles these. Users in that role see restricted sidebar/pages.
 *
 * Table: role_feature_configs
 * PK: (roleName, featureKey) — one row per role × feature combination.
 */
@Entity
@Table(
    name = "role_feature_configs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"role_name", "feature_key"})
)
public class RoleFeatureConfig {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    // Role name string — matches DataSeeder values:
    // ADMIN, RMO, ITSM_MANAGER, END_USER, SUPPORT_PERSONNEL,
    // APPROVAL_MANAGER_L1, APPROVAL_MANAGER_L2, RESOURCE_OWNER
    @Column(name = "role_name", nullable = false, length = 60)
    private String roleName;
 
    // Unique feature key — matches frontend nav path or feature code
    // e.g. "ITSM_TICKETS", "ITSM_SLA", "SUPPORT_KEDB", "END_USER_DRAFTS"
    @Column(name = "feature_key", nullable = false, length = 80)
    private String featureKey;
 
    // Whether this feature is enabled for the role. Default = true.
    @Column(nullable = false)
    private boolean enabled = true;
 
    // Admin who last changed this
    @Column(name = "updated_by", length = 120)
    private String updatedBy;
 
    @CreationTimestamp
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    private LocalDateTime updatedAt;
 
    public RoleFeatureConfig() {}
 
    public RoleFeatureConfig(String roleName, String featureKey,
                              boolean enabled, String updatedBy) {
        this.roleName   = roleName;
        this.featureKey = featureKey;
        this.enabled    = enabled;
        this.updatedBy  = updatedBy;
    }
 
    public Long      getId()                    { return id; }
    public String    getRoleName()              { return roleName; }
    public void      setRoleName(String v)      { this.roleName = v; }
    public String    getFeatureKey()            { return featureKey; }
    public void      setFeatureKey(String v)    { this.featureKey = v; }
    public boolean   isEnabled()               { return enabled; }
    public void      setEnabled(boolean v)      { this.enabled = v; }
    public String    getUpdatedBy()             { return updatedBy; }
    public void      setUpdatedBy(String v)     { this.updatedBy = v; }
    public LocalDateTime getCreatedAt()         { return createdAt; }
    public LocalDateTime getUpdatedAt()         { return updatedAt; }
}
 