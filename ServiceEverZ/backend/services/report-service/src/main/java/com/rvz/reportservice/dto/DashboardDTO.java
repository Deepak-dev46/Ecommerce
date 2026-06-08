package com.rvz.reportservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Response DTO for the prebuilt ITSM Manager dashboard.
 * Covers US-94: ticket pipeline, SLA monitoring, support performance widgets.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardDTO {

    // ── Generated timestamp ───────────────────────────────────────────────────
    private LocalDateTime generatedAt;

    // ── Ticket Pipeline (US-94 positive: tickets in progress, completed, rejected) ──
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long closedTickets;
    private long rejectedTickets;   // CANCELLED maps to "rejected" in UI
    private long onHoldTickets;
    private long reopenedTickets;
    private long unassignedTickets;

    // ── SLA Monitoring (US-94 positive: On Track / Approaching Breach / Breached) ──
    private long slaOnTrackCount;
    private long slaApproachingBreachCount;
    private long slaBreachedCount;
    private double slaCompliancePercentage;

    // ── Support Person Performance (US-94 positive: metrics visible) ──────────
    private List<Map<String, Object>> supportPerformance;

    // ── Ticket pipeline by status (for chart rendering) ───────────────────────
    private Map<String, Long> pipelineBreakdown;

    // ── Recent tickets (for quick-view) ──────────────────────────────────────
    private List<Map<String, Object>> recentTickets;

    public DashboardDTO() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public long getTotalTickets() { return totalTickets; }
    public void setTotalTickets(long totalTickets) { this.totalTickets = totalTickets; }

    public long getOpenTickets() { return openTickets; }
    public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }

    public long getInProgressTickets() { return inProgressTickets; }
    public void setInProgressTickets(long inProgressTickets) { this.inProgressTickets = inProgressTickets; }

    public long getResolvedTickets() { return resolvedTickets; }
    public void setResolvedTickets(long resolvedTickets) { this.resolvedTickets = resolvedTickets; }

    public long getClosedTickets() { return closedTickets; }
    public void setClosedTickets(long closedTickets) { this.closedTickets = closedTickets; }

    public long getRejectedTickets() { return rejectedTickets; }
    public void setRejectedTickets(long rejectedTickets) { this.rejectedTickets = rejectedTickets; }

    public long getOnHoldTickets() { return onHoldTickets; }
    public void setOnHoldTickets(long onHoldTickets) { this.onHoldTickets = onHoldTickets; }

    public long getReopenedTickets() { return reopenedTickets; }
    public void setReopenedTickets(long reopenedTickets) { this.reopenedTickets = reopenedTickets; }

    public long getUnassignedTickets() { return unassignedTickets; }
    public void setUnassignedTickets(long unassignedTickets) { this.unassignedTickets = unassignedTickets; }

    public long getSlaOnTrackCount() { return slaOnTrackCount; }
    public void setSlaOnTrackCount(long slaOnTrackCount) { this.slaOnTrackCount = slaOnTrackCount; }

    public long getSlaApproachingBreachCount() { return slaApproachingBreachCount; }
    public void setSlaApproachingBreachCount(long slaApproachingBreachCount) { this.slaApproachingBreachCount = slaApproachingBreachCount; }

    public long getSlaBreachedCount() { return slaBreachedCount; }
    public void setSlaBreachedCount(long slaBreachedCount) { this.slaBreachedCount = slaBreachedCount; }

    public double getSlaCompliancePercentage() { return slaCompliancePercentage; }
    public void setSlaCompliancePercentage(double slaCompliancePercentage) { this.slaCompliancePercentage = slaCompliancePercentage; }

    public List<Map<String, Object>> getSupportPerformance() { return supportPerformance; }
    public void setSupportPerformance(List<Map<String, Object>> supportPerformance) { this.supportPerformance = supportPerformance; }

    public Map<String, Long> getPipelineBreakdown() { return pipelineBreakdown; }
    public void setPipelineBreakdown(Map<String, Long> pipelineBreakdown) { this.pipelineBreakdown = pipelineBreakdown; }

    public List<Map<String, Object>> getRecentTickets() { return recentTickets; }
    public void setRecentTickets(List<Map<String, Object>> recentTickets) { this.recentTickets = recentTickets; }
}
