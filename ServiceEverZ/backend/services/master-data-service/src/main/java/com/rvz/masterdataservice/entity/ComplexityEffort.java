package com.rvz.masterdataservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "complexity_effort")
public class ComplexityEffort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "complexity_id")
    private Integer complexityId;

    @Column(name = "complexity_level")
    private String complexityLevel;

    @Column(name = "effort_hours")
    private Integer effortHours;

    public ComplexityEffort() {}

    public Integer getComplexityId() { return complexityId; }
    public void setComplexityId(Integer complexityId) { this.complexityId = complexityId; }

    public String getComplexityLevel() { return complexityLevel; }
    public void setComplexityLevel(String complexityLevel) { this.complexityLevel = complexityLevel; }

    public Integer getEffortHours() { return effortHours; }
    public void setEffortHours(Integer effortHours) { this.effortHours = effortHours; }
}
