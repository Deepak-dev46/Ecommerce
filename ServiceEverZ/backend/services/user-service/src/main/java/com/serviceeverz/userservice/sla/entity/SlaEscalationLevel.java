// src/main/java/com/serviceeverz/userservice/sla/entity/SlaEscalationLevel.java
package com.serviceeverz.userservice.sla.entity;
 
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;
 
import java.time.LocalDateTime;
 
/**
 * Defines WHO handles escalation at each level for each priority.
 *
 * Admin sets:
 *   CRITICAL, level=1 → userId=5  (Senior Support Lead)
 *   CRITICAL, level=2 → userId=3  (IT Manager)
 *   CRITICAL, level=3 → userId=1  (CTO)
 *   HIGH,     level=1 → userId=7  (Team Lead)
 *   ...
 *
 * When a CRITICAL ticket breaches SLA:
 *   → escalationLevel becomes 1
 *   → look up CRITICAL+level1 → assign to userId=5
 *   → if still unresolved after breachTimeHours → escalationLevel=2 → userId=3
 */
@Entity
@Table(name = "sla_escalation_levels",
       uniqueConstraints = @UniqueConstraint(columnNames = {"priority", "escalationLevel"}))
public class SlaEscalationLevel {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;
 
    /** 1 = first escalation, 2 = second, 3 = final/executive */
    @Column(nullable = false)
    private int escalationLevel;
 
    /** User ID who receives this escalation (from user-service). */
    @Column(nullable = false)
    private Long userId;
 
    /** Display name (denormalized for fast lookup). */
    @Column(nullable = false, length = 120)
    private String userName;
 
    /** Email for notification (denormalized). */
    @Column(length = 200)
    private String userEmail;
 
    /** Optional: title/role of the escalation person. */
    @Column(length = 100)
    private String role;
 
    @UpdateTimestamp
    private LocalDateTime updatedAt;
 
    // ── Getters & Setters ──────────────────────────────────────────────────────
 
    public Long getId() { return id; }
 
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
 
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
 