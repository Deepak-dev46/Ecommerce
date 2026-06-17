package com.rvz.actionservice.autoclose.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for creating or updating an auto-close configuration.
 * Sent by the ITSM Manager.
 *
 * slaId = null  → global default
 * slaId = X     → SLA-policy-specific override
 */
public class AutoCloseConfigRequest {

    private Long slaId;

    @NotNull(message = "autoCloseHours is required")
    @Min(value = 1, message = "autoCloseHours must be at least 1")
    private Integer autoCloseHours;

    private boolean enabled = true;

    public Long getSlaId() { return slaId; }
    public void setSlaId(Long slaId) { this.slaId = slaId; }

    public Integer getAutoCloseHours() { return autoCloseHours; }
    public void setAutoCloseHours(Integer autoCloseHours) { this.autoCloseHours = autoCloseHours; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
