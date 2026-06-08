package com.rvz.serviceeverz.dto.request;

import com.rvz.serviceeverz.enums.AssetStatus;

import jakarta.validation.constraints.NotNull;
 
public class AssetStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private AssetStatus status;
    private String remarks;
 
    public AssetStatus getStatus()        { return status; }
    public void setStatus(AssetStatus v)  { status = v; }
    public String getRemarks()            { return remarks; }
    public void setRemarks(String v)      { remarks = v; }
}
 