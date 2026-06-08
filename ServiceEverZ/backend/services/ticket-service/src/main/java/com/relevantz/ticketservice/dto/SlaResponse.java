package com.relevantz.ticketservice.dto;

import java.time.LocalDateTime;

public class SlaResponse {

    private String policyName;
    private LocalDateTime deadline;
    private long remainingSeconds;
    private boolean breached;

    public SlaResponse(String policyName, LocalDateTime deadline, long remainingSeconds, boolean breached2) {
        this.policyName = policyName;
        this.deadline = deadline;
        this.remainingSeconds = remainingSeconds;
        this.breached = remainingSeconds < 0;
    }

    public String getPolicyName() { return policyName; }
    public LocalDateTime getDeadline() { return deadline; }
    public long getRemainingSeconds() { return remainingSeconds; }
    public boolean isBreached() { return breached; }
}
