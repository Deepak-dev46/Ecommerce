package com.serviceeverz.userservice.rolefeature.dto;
 
public class RoleFeatureDto {
 
    public String featureKey;
    public String label;
    public String description;
    public String category;
    public String roleName;
    public String path;
    public boolean enabled;
    public boolean defaultOn;
 
    public RoleFeatureDto() {}
 
    public RoleFeatureDto(String featureKey, String label, String description,
                          String category, String roleName, String path,
                          boolean enabled, boolean defaultOn) {
        this.featureKey  = featureKey;
        this.label       = label;
        this.description = description;
        this.category    = category;
        this.roleName    = roleName;
        this.path        = path;
        this.enabled     = enabled;
        this.defaultOn   = defaultOn;
    }
 
    // ✅ Required by service stream filter and Jackson serialization
    public boolean isEnabled()   { return enabled; }
    public boolean isDefaultOn() { return defaultOn; }
    public String getFeatureKey() { return featureKey; }
    public String getRoleName()   { return roleName; }
}
 