package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.NotNull;
 
public class AssetReleaseRequest {
    @NotNull private Long releasedBySpId;
    private String remarks;
 
    public Long getReleasedBySpId() { return releasedBySpId; } public void setReleasedBySpId(Long v) { releasedBySpId = v; }
    public String getRemarks() { return remarks; } public void setRemarks(String v) { remarks = v; }
}
 