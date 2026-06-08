package com.rvz.masterdataservice.dto.response;

public class ServiceSubcategoryResponse {

    private Integer subcategoryId;
    private Integer categoryId;
    private String subcategoryName;

    public ServiceSubcategoryResponse() {}

    public Integer getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Integer subcategoryId) { this.subcategoryId = subcategoryId; }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public String getSubcategoryName() { return subcategoryName; }
    public void setSubcategoryName(String subcategoryName) { this.subcategoryName = subcategoryName; }
}
