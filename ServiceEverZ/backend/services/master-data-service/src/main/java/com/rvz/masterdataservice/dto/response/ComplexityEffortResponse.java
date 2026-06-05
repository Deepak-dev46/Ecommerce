package com.rvz.masterdataservice.dto.response;

public class ComplexityEffortResponse {

    private Integer complexityId;
    private String complexityLevel;
    private Integer effortHours;

    public ComplexityEffortResponse() {}

    public Integer getComplexityId() { return complexityId; }
    public void setComplexityId(Integer complexityId) { this.complexityId = complexityId; }

    public String getComplexityLevel() { return complexityLevel; }
    public void setComplexityLevel(String complexityLevel) { this.complexityLevel = complexityLevel; }

    public Integer getEffortHours() { return effortHours; }
    public void setEffortHours(Integer effortHours) { this.effortHours = effortHours; }
}
