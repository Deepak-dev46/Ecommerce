package com.rvz.masterdataservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "priority_sla")
public class PrioritySla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "priority_id")
    private Integer priorityId;

    @Column(name = "priority_name")
    private String priorityName;

    @Column(name = "response_time_hours")
    private Integer responseTimeHours;

    @Column(name = "resolution_time_hours")
    private Integer resolutionTimeHours;

    @Column(name = "breach_time_hours")
    private Integer breachTimeHours;

    public PrioritySla() {}

    public Integer getPriorityId() { return priorityId; }
    public void setPriorityId(Integer priorityId) { this.priorityId = priorityId; }

    public String getPriorityName() { return priorityName; }
    public void setPriorityName(String priorityName) { this.priorityName = priorityName; }

    public Integer getResponseTimeHours() { return responseTimeHours; }
    public void setResponseTimeHours(Integer responseTimeHours) { this.responseTimeHours = responseTimeHours; }

    public Integer getResolutionTimeHours() { return resolutionTimeHours; }
    public void setResolutionTimeHours(Integer resolutionTimeHours) { this.resolutionTimeHours = resolutionTimeHours; }

    public Integer getBreachTimeHours() { return breachTimeHours; }
    public void setBreachTimeHours(Integer breachTimeHours) { this.breachTimeHours = breachTimeHours; }
}
