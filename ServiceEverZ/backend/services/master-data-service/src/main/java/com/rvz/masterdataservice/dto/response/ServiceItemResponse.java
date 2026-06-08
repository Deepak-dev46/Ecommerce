package com.rvz.masterdataservice.dto.response;

public class ServiceItemResponse {

    private Integer serviceId;
    private String serviceName;
    private Integer typeId;
    private Integer categoryId;
    private Integer subcategoryId;
    private Integer defaultPriority;
    private Integer defaultComplexity;
    private String description;
    private String status;

    public ServiceItemResponse() {}

    public Integer getServiceId() { return serviceId; }
    public void setServiceId(Integer serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Integer getTypeId() { return typeId; }
    public void setTypeId(Integer typeId) { this.typeId = typeId; }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public Integer getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Integer subcategoryId) { this.subcategoryId = subcategoryId; }

    public Integer getDefaultPriority() { return defaultPriority; }
    public void setDefaultPriority(Integer defaultPriority) { this.defaultPriority = defaultPriority; }

    public Integer getDefaultComplexity() { return defaultComplexity; }
    public void setDefaultComplexity(Integer defaultComplexity) { this.defaultComplexity = defaultComplexity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
