package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AssetSpecificationRequest {

    @NotBlank(message = "Specification key is required")
    private String specKey;

    @NotBlank(message = "Specification value is required")
    private String specValue;

    public String getSpecKey()           { return specKey; }
    public void setSpecKey(String v)     { specKey = v; }
    public String getSpecValue()         { return specValue; }
    public void setSpecValue(String v)   { specValue = v; }
}
