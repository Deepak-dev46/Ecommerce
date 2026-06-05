// src/main/java/com/serviceeverz/userservice/sla/dto/SlaEscalationLevelRequest.java
package com.serviceeverz.userservice.sla.dto;
 
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import jakarta.validation.constraints.*;
 
public class SlaEscalationLevelRequest {
 
    @NotNull(message = "Priority is required")
    private TicketPriority priority;
 
    @Min(value = 1, message = "Escalation level must be 1, 2 or 3")
    @Max(value = 3, message = "Escalation level must be 1, 2 or 3")
    private int escalationLevel;
 
    @NotNull(message = "User ID is required")
    private Long userId;
 
    @NotBlank(message = "User name is required")
    @Size(max = 120)
    private String userName;
 
    @Size(max = 200)
    private String userEmail;
 
    @Size(max = 100)
    private String role;
 
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
 
    public int getEscalationLevel() { return escalationLevel; }
    public void setEscalationLevel(int escalationLevel) { this.escalationLevel = escalationLevel; }
 
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
 
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
 
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
 
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
 