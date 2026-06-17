package com.relevantz.ticketservice.model;

import jakarta.persistence.*;

/**
 * FIXED: Maps to the 'services' table (service-catalog data),
 * matching column names: id, name, category_id, subcategory_id.
 */
@Entity
@Table(name = "services")
public class ServiceItem {

    @Id
    @Column(name = "id")
    private Long itemId;

    @Column(name = "name")
    private String itemName;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "subcategory_id")
    private Long subcategoryId;

    @Column(name = "sla_hours")
    private Integer slaHours;

    @Column(name = "requires_approval")
    private Boolean requiresApproval;

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Long subcategoryId) { this.subcategoryId = subcategoryId; }
    public Integer getSlaHours() { return slaHours; }
    public void setSlaHours(Integer slaHours) { this.slaHours = slaHours; }
    public Boolean getRequiresApproval() { return requiresApproval; }
    public void setRequiresApproval(Boolean requiresApproval) { this.requiresApproval = requiresApproval; }
}
