package com.rvz.masterdataservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_items")
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Integer serviceId;

    @Column(name = "service_name")
    private String serviceName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ServiceCategory serviceCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private ServiceSubcategory serviceSubcategory;

    @Column(name = "default_priority")
    private Integer defaultPriority;

    @Column(name = "default_complexity")
    private Integer defaultComplexity;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    public ServiceItem() {}

    public Integer getServiceId() { return serviceId; }
    public void setServiceId(Integer serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }

    public ServiceCategory getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(ServiceCategory serviceCategory) { this.serviceCategory = serviceCategory; }

    public ServiceSubcategory getServiceSubcategory() { return serviceSubcategory; }
    public void setServiceSubcategory(ServiceSubcategory serviceSubcategory) { this.serviceSubcategory = serviceSubcategory; }

    public Integer getDefaultPriority() { return defaultPriority; }
    public void setDefaultPriority(Integer defaultPriority) { this.defaultPriority = defaultPriority; }

    public Integer getDefaultComplexity() { return defaultComplexity; }
    public void setDefaultComplexity(Integer defaultComplexity) { this.defaultComplexity = defaultComplexity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
