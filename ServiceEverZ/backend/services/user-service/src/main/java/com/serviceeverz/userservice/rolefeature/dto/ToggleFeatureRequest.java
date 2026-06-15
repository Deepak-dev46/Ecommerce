// FILE: user-service/src/main/java/com/serviceeverz/userservice/rolefeature/dto/ToggleFeatureRequest.java
package com.serviceeverz.userservice.rolefeature.dto;
 
import java.util.List;
 
public class ToggleFeatureRequest {
 
    // Toggle single feature
    private String  roleName;
    private String  featureKey;
    private boolean enabled;
 
    // Bulk toggle — list of featureKeys for one role
    private List<String> featureKeys;
 
    public String       getRoleName()            { return roleName; }
    public void         setRoleName(String v)    { this.roleName = v; }
    public String       getFeatureKey()          { return featureKey; }
    public void         setFeatureKey(String v)  { this.featureKey = v; }
    public boolean      isEnabled()             { return enabled; }
    public void         setEnabled(boolean v)    { this.enabled = v; }
    public List<String> getFeatureKeys()         { return featureKeys; }
    public void         setFeatureKeys(List<String> v) { this.featureKeys = v; }
}
 