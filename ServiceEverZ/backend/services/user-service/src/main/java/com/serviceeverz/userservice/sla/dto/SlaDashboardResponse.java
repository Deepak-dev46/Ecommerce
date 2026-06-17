// src/main/java/com/serviceeverz/userservice/sla/dto/SlaDashboardResponse.java
package com.serviceeverz.userservice.sla.dto;
 
import java.util.List;
import java.util.Map;
 
/**
 * Aggregated SLA dashboard data for admin view.
 * All computed on backend — frontend just renders.
 */
public class SlaDashboardResponse {
 
    private long totalEvaluations;
    private long onTrackCount;
    private long atRiskCount;
    private long breachedCount;
    private long metCount;
 
    /** Compliance % = (met / total) * 100 */
    private double complianceRate;
 
    /** Breach % = (breached / total) * 100 */
    private double breachRate;
 
    /** Count of breached tickets per priority: { "CRITICAL": 2, "HIGH": 5 } */
    private Map<String, Long> breachByPriority;
 
    /** Last 10 breached evaluations for quick view */
    private List<SlaEvaluationResponse> recentBreaches;
 
    /** Currently at-risk tickets */
    private List<SlaEvaluationResponse> atRiskTickets;
 
    // ── Getters & Setters ─────────────────────────────────────────────────────
 
    public long getTotalEvaluations() { return totalEvaluations; }
    public void setTotalEvaluations(long totalEvaluations) { this.totalEvaluations = totalEvaluations; }
 
    public long getOnTrackCount() { return onTrackCount; }
    public void setOnTrackCount(long onTrackCount) { this.onTrackCount = onTrackCount; }
 
    public long getAtRiskCount() { return atRiskCount; }
    public void setAtRiskCount(long atRiskCount) { this.atRiskCount = atRiskCount; }
 
    public long getBreachedCount() { return breachedCount; }
    public void setBreachedCount(long breachedCount) { this.breachedCount = breachedCount; }
 
    public long getMetCount() { return metCount; }
    public void setMetCount(long metCount) { this.metCount = metCount; }
 
    public double getComplianceRate() { return complianceRate; }
    public void setComplianceRate(double complianceRate) { this.complianceRate = complianceRate; }
 
    public double getBreachRate() { return breachRate; }
    public void setBreachRate(double breachRate) { this.breachRate = breachRate; }
 
    public Map<String, Long> getBreachByPriority() { return breachByPriority; }
    public void setBreachByPriority(Map<String, Long> breachByPriority) { this.breachByPriority = breachByPriority; }
 
    public List<SlaEvaluationResponse> getRecentBreaches() { return recentBreaches; }
    public void setRecentBreaches(List<SlaEvaluationResponse> recentBreaches) { this.recentBreaches = recentBreaches; }
 
    public List<SlaEvaluationResponse> getAtRiskTickets() { return atRiskTickets; }
    public void setAtRiskTickets(List<SlaEvaluationResponse> atRiskTickets) { this.atRiskTickets = atRiskTickets; }
}
 