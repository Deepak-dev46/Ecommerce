package com.rvz.serviceeverz.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class FreezeWindowRequest {
    @NotBlank(message = "Reason is required") private String reason;
    @NotNull(message = "Freeze start is required") private LocalDateTime freezeStart;
    @NotNull(message = "Freeze end is required") private LocalDateTime freezeEnd;
    @NotNull(message = "Manager ID is required") private Long createdByManagerId;

    public FreezeWindowRequest() {}
    public String getReason() { return reason; } public void setReason(String v) { reason = v; }
    public LocalDateTime getFreezeStart() { return freezeStart; } public void setFreezeStart(LocalDateTime v) { freezeStart = v; }
    public LocalDateTime getFreezeEnd() { return freezeEnd; } public void setFreezeEnd(LocalDateTime v) { freezeEnd = v; }
    public Long getCreatedByManagerId() { return createdByManagerId; } public void setCreatedByManagerId(Long v) { createdByManagerId = v; }
}
