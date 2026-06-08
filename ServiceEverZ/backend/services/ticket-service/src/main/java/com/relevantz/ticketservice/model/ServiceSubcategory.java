package com.relevantz.ticketservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "subcategories")
public class ServiceSubcategory {

    @Id
    @Column(name = "id")
    private Long subcategoryId;

    @Column(name = "name")
    private String subcategoryName;

    @Column(name = "category_id")
    private Long categoryId;

    public Long getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Long subcategoryId) { this.subcategoryId = subcategoryId; }
    public String getSubcategoryName() { return subcategoryName; }
    public void setSubcategoryName(String subcategoryName) { this.subcategoryName = subcategoryName; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}
