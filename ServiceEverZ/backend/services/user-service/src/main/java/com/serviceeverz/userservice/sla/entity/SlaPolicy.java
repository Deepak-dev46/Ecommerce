// src/main/java/com/serviceeverz/userservice/sla/entity/SlaPolicy.java
package com.serviceeverz.userservice.sla.entity;
 
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
 
import java.time.LocalDateTime;
 
/**
 * SLA Policy — one row per TicketPriority.
 *
 * Exposes both minutes (internal) and hours (external/API) for all time fields.
 * priorityId = the entity primary key (id).
 * priorityName = human-readable label derived from priority enum.
 * breachTimeHours = grace period after responseDeadline before escalation triggers.
 *
 * DB table: sla_policies
 * Unique constraint on: priority
 */
@Entity
@Table(name = "sla_policies",
       uniqueConstraints = @UniqueConstraint(columnNames = "priority"))
public class SlaPolicy {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // This IS the priorityId exposed in responses
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private TicketPriority priority;
 
    /** Human-readable name stored for easy external consumption. */
    @Column(nullable = false, length = 50)
    private String priorityName;
 
    /** Minutes from ticket creation → first response must happen. */
    @Column(nullable = false)
    private int responseTimeMinutes;
 
    /** Minutes from ticket creation → ticket must be fully resolved. */
    @Column(nullable = false)
    private int resolutionTimeMinutes;
 
    /**
     * Minutes after resolutionDeadline before auto-escalation triggers.
     * breachTimeHours = this value / 60 in responses.
     * Typically: CRITICAL=120, HIGH=240, MEDIUM=720, LOW=1440 minutes.
     */
    @Column(nullable = false)
    private int breachTimeMinutes = 120;
 
    @Column(nullable = false)
    private boolean active = true;
 
    @Column(length = 500)
    private String description;
 
    @CreationTimestamp
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    private LocalDateTime updatedAt;
 
    // ── Derived helpers ────────────────────────────────────────────────────────
 
    /** Returns the policy id as the "priority ID" expected by other services. */
    public Long getPriorityId() { return id; }
 
    /** e.g. "Critical", "High" */
    public String getPriorityName() { return priorityName; }
    public void setPriorityName(String priorityName) { this.priorityName = priorityName; }
 
    /** responseTimeMinutes / 60.0 — for external API */
    public double getResponseTimeHours() { return responseTimeMinutes / 60.0; }
 
    /** resolutionTimeMinutes / 60.0 — for external API */
    public double getResolutionTimeHours() { return resolutionTimeMinutes / 60.0; }
 
    /** breachTimeMinutes / 60.0 — for external API */
    public double getBreachTimeHours() { return breachTimeMinutes / 60.0; }
 
    // ── Getters & Setters ──────────────────────────────────────────────────────
 
    public Long getId() { return id; }
 
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) {
        this.priority = priority;
        // Auto-derive priorityName from enum
        if (priority != null) {
            String name = priority.name();
            this.priorityName = name.charAt(0) + name.substring(1).toLowerCase();
        }
    }
 
    public int getResponseTimeMinutes() { return responseTimeMinutes; }
    public void setResponseTimeMinutes(int v) { this.responseTimeMinutes = v; }
 
    public int getResolutionTimeMinutes() { return resolutionTimeMinutes; }
    public void setResolutionTimeMinutes(int v) { this.resolutionTimeMinutes = v; }
 
    public int getBreachTimeMinutes() { return breachTimeMinutes; }
    public void setBreachTimeMinutes(int v) { this.breachTimeMinutes = v; }
 
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
 
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
 
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
 