package com.serviceeverz.roleservice.role.dto;
 
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
 
public class CreateRoleRequest {
 
    @NotBlank(message = "Role name is required")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]{1,49}$",
             message = "Role name must be uppercase letters, digits and underscores (e.g. CUSTOM_ROLE)")
    private String name;
 
    private String description;
 
    public String getName()                 { return name; }
    public void setName(String name)        { this.name = name.trim().toUpperCase(); }
    public String getDescription()          { return description; }
    public void setDescription(String desc) { this.description = desc; }
}
 