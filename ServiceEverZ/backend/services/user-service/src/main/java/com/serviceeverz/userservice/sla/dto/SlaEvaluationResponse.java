// src/main/java/com/serviceeverz/userservice/sla/dto/SlaEvaluationResponse.java
package com.serviceeverz.userservice.sla.dto;
 
import com.serviceeverz.userservice.sla.entity.SlaEvaluation;
import com.serviceeverz.userservice.sla.enums.SlaStatus;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import com.serviceeverz.userservice.sla.enums.TicketStatus;
 
import java.time.Duration;
import java.time.LocalDateTime;
 
public class SlaEvaluationResponse {
 
    private Long id;
    private Long ticketId;
    private String ticketNumber;
    private String subject;
    private Long raisedByUserId;
    private String raisedByName;
    private TicketPriority priority;
    private TicketStatus ticketStatus;
    private LocalDateTime ticketCreatedAt;
    private LocalDateTime firstResponseAt;
 
    // Lifecycle
    private LocalDateTime pausedAt;
    private LocalDateTime resumedAt;
    private LocalDateTime closureTime;
    private LocalDateTime resolvedAt;
    private long totalPausedMinutes;
    private boolean onHold;
 
    // Deadlines
    private LocalDateTime responseDeadline;
    private LocalDateTime resolutionDeadline;
    private SlaStatus slaStatus;
    private boolean responseBreached;
    private boolean resolutionBreached;
 
    // ── Remaining time (minutes + seconds) ─────────────────────────────────
    private long responseMinutesRemaining;
    private long resolutionMinutesRemaining;
 
    /** NEW: seconds component (0-59) for live countdown display */
    private long responseSecondsRemaining;
    private long resolutionSecondsRemaining;
 
    /** NEW: total seconds remaining (for JS live countdown) */
    private long responseTotalSecondsRemaining;
    private long resolutionTotalSecondsRemaining;
 
    // ── Actual elapsed times ────────────────────────────────────────────────
    /** NEW: seconds from ticketCreatedAt → firstResponseAt (null if not yet responded) */
    private Long actualResponseTimeSeconds;
 
    /** NEW: seconds from ticketCreatedAt → closureTime (null if not yet resolved) */
    private Long actualResolutionTimeSeconds;
 
    /** NEW: seconds from ticketCreatedAt → resolvedAt/closureTime (time-to-close) */
    private Long timeToCloseSeconds;
 
    // Escalation
    private int escalationLevel;
    private Long escalatedToUserId;
    private String escalatedToName;
    private LocalDateTime escalatedAt;
 
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
 
    public static SlaEvaluationResponse from(SlaEvaluation e) {
        SlaEvaluationResponse r = new SlaEvaluationResponse();
        r.id                     = e.getId();
        r.ticketId               = e.getTicketId();
        r.ticketNumber           = e.getTicketNumber();
        r.subject                = e.getSubject();
        r.raisedByUserId         = e.getRaisedByUserId();
        r.raisedByName           = e.getRaisedByName();
        r.priority               = e.getPriority();
        r.ticketStatus           = e.getTicketStatus();
        r.ticketCreatedAt        = e.getTicketCreatedAt();
        r.firstResponseAt        = e.getFirstResponseAt();
        r.pausedAt               = e.getPausedAt();
        r.resumedAt              = e.getResumedAt();
        r.closureTime            = e.getClosureTime();
        r.resolvedAt             = e.getResolvedAt();
        r.totalPausedMinutes     = e.getTotalPausedMinutes();
        r.onHold                 = e.isOnHold();
        r.responseDeadline       = e.getResponseDeadline();
        r.resolutionDeadline     = e.getResolutionDeadline();
        r.slaStatus              = e.getSlaStatus();
        r.responseBreached       = e.isResponseBreached();
        r.resolutionBreached     = e.isResolutionBreached();
        r.escalationLevel        = e.getEscalationLevel();
        r.escalatedToUserId      = e.getEscalatedToUserId();
        r.escalatedToName        = e.getEscalatedToName();
        r.escalatedAt            = e.getEscalatedAt();
        r.createdAt              = e.getCreatedAt();
        r.updatedAt              = e.getUpdatedAt();
 
        LocalDateTime now = LocalDateTime.now();
 
        // ── Remaining time (clamp to 0, never negative) ─────────────────────
        Duration respRemaining = Duration.between(now, e.getResponseDeadline());
        Duration resoRemaining = Duration.between(now, e.getResolutionDeadline());
 
        long respTotalSecs = Math.max(0, respRemaining.getSeconds());
        long resoTotalSecs = Math.max(0, resoRemaining.getSeconds());
 
        r.responseTotalSecondsRemaining   = respTotalSecs;
        r.resolutionTotalSecondsRemaining = resoTotalSecs;
        r.responseMinutesRemaining        = respTotalSecs / 60;
        r.resolutionMinutesRemaining      = resoTotalSecs / 60;
        r.responseSecondsRemaining        = respTotalSecs % 60;
        r.resolutionSecondsRemaining      = resoTotalSecs % 60;
 
        // ── Actual response time ────────────────────────────────────────────
        if (e.getFirstResponseAt() != null && e.getTicketCreatedAt() != null) {
            r.actualResponseTimeSeconds =
                Duration.between(e.getTicketCreatedAt(), e.getFirstResponseAt()).getSeconds();
        }
 
        // ── Actual resolution time (closureTime = when RESOLVED declared) ───
        LocalDateTime closePoint = e.getClosureTime() != null ? e.getClosureTime()
                                 : e.getResolvedAt()  != null ? e.getResolvedAt()
                                 : null;
        if (closePoint != null && e.getTicketCreatedAt() != null) {
            long totalSecs = Duration.between(e.getTicketCreatedAt(), closePoint).getSeconds();
            // Subtract paused duration
            long pausedSecs = e.getTotalPausedMinutes() * 60L;
            r.actualResolutionTimeSeconds = Math.max(0, totalSecs - pausedSecs);
            r.timeToCloseSeconds          = totalSecs; // raw wall-clock time including pauses
        }
 
        return r;
    }
 
    // ── Getters ───────────────────────────────────────────────────────────────
    public Long getId()                                { return id; }
    public Long getTicketId()                          { return ticketId; }
    public String getTicketNumber()                    { return ticketNumber; }
    public String getSubject()                         { return subject; }
    public Long getRaisedByUserId()                    { return raisedByUserId; }
    public String getRaisedByName()                    { return raisedByName; }
    public TicketPriority getPriority()                { return priority; }
    public TicketStatus getTicketStatus()              { return ticketStatus; }
    public LocalDateTime getTicketCreatedAt()          { return ticketCreatedAt; }
    public LocalDateTime getFirstResponseAt()          { return firstResponseAt; }
    public LocalDateTime getPausedAt()                 { return pausedAt; }
    public LocalDateTime getResumedAt()                { return resumedAt; }
    public LocalDateTime getClosureTime()              { return closureTime; }
    public LocalDateTime getResolvedAt()               { return resolvedAt; }
    public long getTotalPausedMinutes()                { return totalPausedMinutes; }
    public boolean isOnHold()                          { return onHold; }
    public LocalDateTime getResponseDeadline()         { return responseDeadline; }
    public LocalDateTime getResolutionDeadline()       { return resolutionDeadline; }
    public SlaStatus getSlaStatus()                    { return slaStatus; }
    public boolean isResponseBreached()                { return responseBreached; }
    public boolean isResolutionBreached()              { return resolutionBreached; }
    public long getResponseMinutesRemaining()          { return responseMinutesRemaining; }
    public long getResolutionMinutesRemaining()        { return resolutionMinutesRemaining; }
    public long getResponseSecondsRemaining()          { return responseSecondsRemaining; }
    public long getResolutionSecondsRemaining()        { return resolutionSecondsRemaining; }
    public long getResponseTotalSecondsRemaining()     { return responseTotalSecondsRemaining; }
    public long getResolutionTotalSecondsRemaining()   { return resolutionTotalSecondsRemaining; }
    public Long getActualResponseTimeSeconds()         { return actualResponseTimeSeconds; }
    public Long getActualResolutionTimeSeconds()       { return actualResolutionTimeSeconds; }
    public Long getTimeToCloseSeconds()                { return timeToCloseSeconds; }
    public int getEscalationLevel()                    { return escalationLevel; }
    public Long getEscalatedToUserId()                 { return escalatedToUserId; }
    public String getEscalatedToName()                 { return escalatedToName; }
    public LocalDateTime getEscalatedAt()              { return escalatedAt; }
    public LocalDateTime getCreatedAt()                { return createdAt; }
    public LocalDateTime getUpdatedAt()                { return updatedAt; }
}
 