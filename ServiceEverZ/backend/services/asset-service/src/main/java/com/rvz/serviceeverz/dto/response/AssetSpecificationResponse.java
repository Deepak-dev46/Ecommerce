package com.rvz.serviceeverz.dto.response;

public class AssetSpecificationResponse {
    private String specKey;
    private String specValue;

    public AssetSpecificationResponse() {}
    public AssetSpecificationResponse(String k, String v) { specKey = k; specValue = v; }

    public String getSpecKey()           { return specKey; }
    public void setSpecKey(String v)     { specKey = v; }
    public String getSpecValue()         { return specValue; }
    public void setSpecValue(String v)   { specValue = v; }
}
