package com.rvz.assignmentservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "support_personnel_capacity")
public class SupportPersonnelCapacity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "capacity_id")
    private Long capacityId;
    @Column(name = "support_person_id")
    private Long supportPersonId;
    @Column(name = "support_person_name")
    private String supportPersonName;
    @Column(name = "service_type")
    private String serviceType;
    @Column(name = "active")
    private Boolean active;
    @Column(name = "total_response_time_hours")
    private Double totalResponseTimeHours;
    @Column(name = "total_estimated_hours")
    private Double totalEstimatedHours;

    public SupportPersonnelCapacity() {}
    public Long getCapacityId() { return capacityId; }
    public void setCapacityId(Long capacityId) { this.capacityId = capacityId; }
    public Long getSupportPersonId() { return supportPersonId; }
    public void setSupportPersonId(Long supportPersonId) { this.supportPersonId = supportPersonId; }
    public String getSupportPersonName() { return supportPersonName; }
    public void setSupportPersonName(String supportPersonName) { this.supportPersonName = supportPersonName; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Double getTotalResponseTimeHours() { return totalResponseTimeHours; }
    public void setTotalResponseTimeHours(Double totalResponseTimeHours) { this.totalResponseTimeHours = totalResponseTimeHours; }
    public Double getTotalEstimatedHours() { return totalEstimatedHours; }
    public void setTotalEstimatedHours(Double totalEstimatedHours) { this.totalEstimatedHours = totalEstimatedHours; }
}
