// src/main/java/com/serviceeverz/userservice/sla/dto/SlaPolicyRequest.java
package com.serviceeverz.userservice.sla.dto;
 
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import jakarta.validation.constraints.*;
 
/**
 * Accepts EITHER minutes OR hours — hours take precedence if provided.
 * breachTimeHours: grace window after resolutionDeadline before escalation triggers.
 */
public class SlaPolicyRequest {
 
    @NotNull(message = "Priority is required")
    private TicketPriority priority;
 
    // Accept minutes (legacy) OR hours (new)
    private Integer responseTimeMinutes;
    private Integer resolutionTimeMinutes;
    private Integer breachTimeMinutes;
 
    /** Hours input — converted to minutes on save. Overrides minutes if set. */
    private Double responseTimeHours;
    private Double resolutionTimeHours;
 
    /**
     * Breach time hours — grace period after resolutionDeadline → triggers escalation.
     * Overrides breachTimeMinutes if set.
     */
    private Double breachTimeHours;
 
    private boolean active = true;
 
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
 
    // ── Resolved getters (hours take precedence over minutes) ─────────────────
 
    public int resolvedResponseMinutes() {
        if (responseTimeHours != null) return (int) Math.round(responseTimeHours * 60);
        return responseTimeMinutes != null ? responseTimeMinutes : 60;
    }
 
    public int resolvedResolutionMinutes() {
        if (resolutionTimeHours != null) return (int) Math.round(resolutionTimeHours * 60);
        return resolutionTimeMinutes != null ? resolutionTimeMinutes : 240;
    }
 
    public int resolvedBreachMinutes() {
        if (breachTimeHours != null) return (int) Math.round(breachTimeHours * 60);
        return breachTimeMinutes != null ? breachTimeMinutes : 120;
    }
 
    // ── Getters & Setters ─────────────────────────────────────────────────────
 
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
 
    public Integer getResponseTimeMinutes() { return responseTimeMinutes; }
    public void setResponseTimeMinutes(Integer responseTimeMinutes) { this.responseTimeMinutes = responseTimeMinutes; }
 
    public Integer getResolutionTimeMinutes() { return resolutionTimeMinutes; }
    public void setResolutionTimeMinutes(Integer resolutionTimeMinutes) { this.resolutionTimeMinutes = resolutionTimeMinutes; }
 
    public Integer getBreachTimeMinutes() { return breachTimeMinutes; }
    public void setBreachTimeMinutes(Integer breachTimeMinutes) { this.breachTimeMinutes = breachTimeMinutes; }
 
    public Double getResponseTimeHours() { return responseTimeHours; }
    public void setResponseTimeHours(Double responseTimeHours) { this.responseTimeHours = responseTimeHours; }
 
    public Double getResolutionTimeHours() { return resolutionTimeHours; }
    public void setResolutionTimeHours(Double resolutionTimeHours) { this.resolutionTimeHours = resolutionTimeHours; }
 
    public Double getBreachTimeHours() { return breachTimeHours; }
    public void setBreachTimeHours(Double breachTimeHours) { this.breachTimeHours = breachTimeHours; }
 
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
 
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
 