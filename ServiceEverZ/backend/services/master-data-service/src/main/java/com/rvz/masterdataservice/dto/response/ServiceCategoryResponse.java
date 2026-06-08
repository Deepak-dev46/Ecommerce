package com.rvz.masterdataservice.dto.response;

public class ServiceCategoryResponse {

    private Integer categoryId;
    private Integer typeId;
    private String categoryName;

    public ServiceCategoryResponse() {}

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public Integer getTypeId() { return typeId; }
    public void setTypeId(Integer typeId) { this.typeId = typeId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}
