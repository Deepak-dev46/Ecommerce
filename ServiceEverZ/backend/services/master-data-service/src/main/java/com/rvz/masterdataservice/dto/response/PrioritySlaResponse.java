package com.rvz.masterdataservice.dto.response;

public class PrioritySlaResponse {

    private Integer priorityId;
    private String priorityName;
    private Integer responseTimeHours;
    private Integer resolutionTimeHours;
    private Integer breachTimeHours;

    public PrioritySlaResponse() {}

    // ── EXISTING getters/setters – NOT MODIFIED ─────────────────────────────

    public Integer getPriorityId() { return priorityId; }
    public void setPriorityId(Integer priorityId) { this.priorityId = priorityId; }

    public String getPriorityName() { return priorityName; }
    public void setPriorityName(String priorityName) { this.priorityName = priorityName; }

    public Integer getResponseTimeHours() { return responseTimeHours; }
    public void setResponseTimeHours(Integer responseTimeHours) { this.responseTimeHours = responseTimeHours; }

    public Integer getResolutionTimeHours() { return resolutionTimeHours; }
    public void setResolutionTimeHours(Integer resolutionTimeHours) { this.resolutionTimeHours = resolutionTimeHours; }

    public Integer getBreachTimeHours() { return breachTimeHours; }
    public void setBreachTimeHours(Integer breachTimeHours) { this.breachTimeHours = breachTimeHours; }

    // ── NEW alias getter – Added for email-ticket-service (Story 22) ─────────
    // The email-ticket-service's resolvePriorityId() reads the key "prioritySlaId"
    // from the JSON response map. The entity field is named priorityId.
    // This alias getter makes Jackson serialize it as "prioritySlaId" as well,
    // so both the existing API consumers and the email service work correctly.

    /** Alias for email-ticket-service: resolvePriorityId looks up "prioritySlaId" in the response map. */
    public Integer getPrioritySlaId() { return priorityId; }
}
