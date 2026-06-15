package com.rvz.serviceeverz.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
 
public class AdditionalDetailsRequest {
    @NotNull private Long userId;
    @NotBlank(message = "Details cannot be blank") private String details;
 
    public Long getUserId() { return userId; } public void setUserId(Long v) { userId = v; }
    public String getDetails() { return details; } public void setDetails(String v) { details = v; }
}
 