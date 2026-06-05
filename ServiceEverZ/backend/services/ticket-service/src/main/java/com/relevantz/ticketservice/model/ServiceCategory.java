package com.relevantz.ticketservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class ServiceCategory {

    @Id
    @Column(name = "id")
    private Long categoryId;

    @Column(name = "name")
    private String categoryName;

    @Column(name = "service_type_id")
    private Long typeId;

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Long getTypeId() { return typeId; }
    public void setTypeId(Long typeId) { this.typeId = typeId; }
}
