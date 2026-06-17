package com.rvz.actionservice.autoclose.dto;

import com.rvz.actionservice.autoclose.entity.AutoCloseConfig;
import java.time.LocalDateTime;

public class AutoCloseConfigResponse {

    private Long id;
    private Long slaId;
    private int autoCloseHours;
    private boolean enabled;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AutoCloseConfigResponse from(AutoCloseConfig config) {
        AutoCloseConfigResponse r = new AutoCloseConfigResponse();
        r.id = config.getId();
        r.slaId = config.getSlaId();
        r.autoCloseHours = config.getAutoCloseHours();
        r.enabled = config.isEnabled();
        r.createdBy = config.getCreatedBy();
        r.createdAt = config.getCreatedAt();
        r.updatedAt = config.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public Long getSlaId() { return slaId; }
    public int getAutoCloseHours() { return autoCloseHours; }
    public boolean isEnabled() { return enabled; }
    public Long getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
