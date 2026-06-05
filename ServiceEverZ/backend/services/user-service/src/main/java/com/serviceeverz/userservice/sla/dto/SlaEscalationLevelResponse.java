// src/main/java/com/serviceeverz/userservice/sla/dto/SlaEscalationLevelResponse.java
package com.serviceeverz.userservice.sla.dto;
 
import com.serviceeverz.userservice.sla.entity.SlaEscalationLevel;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
 
import java.time.LocalDateTime;
 
public class SlaEscalationLevelResponse {
 
    private Long id;
    private TicketPriority priority;
    private int escalationLevel;
    private String escalationLevelLabel; // "L1 — First Escalation"
    private Long userId;
    private String userName;
    private String userEmail;
    private String role;
    private LocalDateTime updatedAt;
 
    public static SlaEscalationLevelResponse from(SlaEscalationLevel e) {
        SlaEscalationLevelResponse r = new SlaEscalationLevelResponse();
        r.id                  = e.getId();
        r.priority            = e.getPriority();
        r.escalationLevel     = e.getEscalationLevel();
        r.escalationLevelLabel = switch (e.getEscalationLevel()) {
            case 1  -> "L1 — First Escalation";
            case 2  -> "L2 — Second Escalation";
            case 3  -> "L3 — Executive Escalation";
            default -> "L" + e.getEscalationLevel();
        };
        r.userId   = e.getUserId();
        r.userName = e.getUserName();
        r.userEmail = e.getUserEmail();
        r.role     = e.getRole();
        r.updatedAt = e.getUpdatedAt();
        return r;
    }
 
    public Long getId() { return id; }
    public TicketPriority getPriority() { return priority; }
    public int getEscalationLevel() { return escalationLevel; }
    public String getEscalationLevelLabel() { return escalationLevelLabel; }
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public String getRole() { return role; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
 