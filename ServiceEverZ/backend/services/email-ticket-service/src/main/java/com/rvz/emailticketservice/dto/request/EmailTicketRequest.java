package com.rvz.emailticketservice.dto.request;

import java.time.LocalDate;

/**
 * Mirrors ticket-service CreateTicketRequest exactly.
 * Mode is always forced to "Email" for all tickets created by this service.
 */
public class EmailTicketRequest {

    private Long      requestedById;
    private String    requestedByName;
    private Long      projectId;
    private Integer   categoryId;
    private Integer   subCategoryId;
    private Integer   itemId;
    private Integer   priorityId;
    private Long      assetId;

    private String    category;
    private String    subCategory;
    private String    item;
    private String    priority;
    private String    asset;

    private String    subject;
    private String    description;
    private String    location;
    private String    mobileNumber;

    private String    attachmentName;
    private Long      attachmentSizeBytes;
    private LocalDate accessRequiredTill;

    /** Always "Email" – set in service layer, never overridden. */
    private String mode = "Email";

    public EmailTicketRequest() {}

    public Long      getRequestedById()                              { return requestedById; }
    public void      setRequestedById(Long v)                        { this.requestedById = v; }
    public String    getRequestedByName()                            { return requestedByName; }
    public void      setRequestedByName(String v)                    { this.requestedByName = v; }
    public Long      getProjectId()                                  { return projectId; }
    public void      setProjectId(Long v)                            { this.projectId = v; }
    public Integer   getCategoryId()                                 { return categoryId; }
    public void      setCategoryId(Integer v)                        { this.categoryId = v; }
    public Integer   getSubCategoryId()                              { return subCategoryId; }
    public void      setSubCategoryId(Integer v)                     { this.subCategoryId = v; }
    public Integer   getItemId()                                     { return itemId; }
    public void      setItemId(Integer v)                            { this.itemId = v; }
    public Integer   getPriorityId()                                 { return priorityId; }
    public void      setPriorityId(Integer v)                        { this.priorityId = v; }
    public Long      getAssetId()                                    { return assetId; }
    public void      setAssetId(Long v)                              { this.assetId = v; }
    public String    getCategory()                                   { return category; }
    public void      setCategory(String v)                           { this.category = v; }
    public String    getSubCategory()                                { return subCategory; }
    public void      setSubCategory(String v)                        { this.subCategory = v; }
    public String    getItem()                                       { return item; }
    public void      setItem(String v)                               { this.item = v; }
    public String    getPriority()                                   { return priority; }
    public void      setPriority(String v)                           { this.priority = v; }
    public String    getAsset()                                      { return asset; }
    public void      setAsset(String v)                              { this.asset = v; }
    public String    getSubject()                                    { return subject; }
    public void      setSubject(String v)                            { this.subject = v; }
    public String    getDescription()                                { return description; }
    public void      setDescription(String v)                        { this.description = v; }
    public String    getLocation()                                   { return location; }
    public void      setLocation(String v)                           { this.location = v; }
    public String    getMobileNumber()                               { return mobileNumber; }
    public void      setMobileNumber(String v)                       { this.mobileNumber = v; }
    public String    getAttachmentName()                             { return attachmentName; }
    public void      setAttachmentName(String v)                     { this.attachmentName = v; }
    public Long      getAttachmentSizeBytes()                        { return attachmentSizeBytes; }
    public void      setAttachmentSizeBytes(Long v)                  { this.attachmentSizeBytes = v; }
    public LocalDate getAccessRequiredTill()                         { return accessRequiredTill; }
    public void      setAccessRequiredTill(LocalDate v)              { this.accessRequiredTill = v; }
    public String    getMode()                                       { return mode; }
    public void      setMode(String mode)                            { this.mode = mode; }
}
