// src/main/java/com/serviceeverz/userservice/sla/dto/SlaPolicyResponse.java
package com.serviceeverz.userservice.sla.dto;
 
import com.serviceeverz.userservice.sla.entity.SlaPolicy;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
 
import java.time.LocalDateTime;
 
/**
 * Exposes priorityId, priorityName, *TimeHours fields as required by other services.
 */
public class SlaPolicyResponse {
 
    /** = the entity primary key — acts as priorityId for external consumers */
    private Long priorityId;
    private TicketPriority priority;
    private String priorityName;
 
    // Minutes (internal)
    private int responseTimeMinutes;
    private int resolutionTimeMinutes;
    private int breachTimeMinutes;
 
    // Hours (external — what other services and frontend use)
    private double responseTimeHours;
    private double resolutionTimeHours;
    private double breachTimeHours;
 
    // Human-readable labels
    private String responseTimeLabel;
    private String resolutionTimeLabel;
    private String breachTimeLabel;
 
    private boolean active;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
 
    public static SlaPolicyResponse from(SlaPolicy p) {
        SlaPolicyResponse r = new SlaPolicyResponse();
        r.priorityId             = p.getId();           // id IS the priorityId
        r.priority               = p.getPriority();
        r.priorityName           = p.getPriorityName();
        r.responseTimeMinutes    = p.getResponseTimeMinutes();
        r.resolutionTimeMinutes  = p.getResolutionTimeMinutes();
        r.breachTimeMinutes      = p.getBreachTimeMinutes();
        r.responseTimeHours      = p.getResponseTimeHours();
        r.resolutionTimeHours    = p.getResolutionTimeHours();
        r.breachTimeHours        = p.getBreachTimeHours();
        r.responseTimeLabel      = formatMinutes(p.getResponseTimeMinutes());
        r.resolutionTimeLabel    = formatMinutes(p.getResolutionTimeMinutes());
        r.breachTimeLabel        = formatMinutes(p.getBreachTimeMinutes());
        r.active                 = p.isActive();
        r.description            = p.getDescription();
        r.createdAt              = p.getCreatedAt();
        r.updatedAt              = p.getUpdatedAt();
        return r;
    }
 
    private static String formatMinutes(int minutes) {
        if (minutes < 60) return minutes + " min";
        if (minutes < 1440) {
            int h = minutes / 60, r = minutes % 60;
            return r == 0 ? h + " hr" : h + " hr " + r + " min";
        }
        int d = minutes / 1440, rh = (minutes % 1440) / 60;
        return rh == 0 ? d + " day" : d + " day " + rh + " hr";
    }
 
    // ── Getters ───────────────────────────────────────────────────────────────
    public Long getPriorityId() { return priorityId; }
    public TicketPriority getPriority() { return priority; }
    public String getPriorityName() { return priorityName; }
    public int getResponseTimeMinutes() { return responseTimeMinutes; }
    public int getResolutionTimeMinutes() { return resolutionTimeMinutes; }
    public int getBreachTimeMinutes() { return breachTimeMinutes; }
    public double getResponseTimeHours() { return responseTimeHours; }
    public double getResolutionTimeHours() { return resolutionTimeHours; }
    public double getBreachTimeHours() { return breachTimeHours; }
    public String getResponseTimeLabel() { return responseTimeLabel; }
    public String getResolutionTimeLabel() { return resolutionTimeLabel; }
    public String getBreachTimeLabel() { return breachTimeLabel; }
    public boolean isActive() { return active; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
 