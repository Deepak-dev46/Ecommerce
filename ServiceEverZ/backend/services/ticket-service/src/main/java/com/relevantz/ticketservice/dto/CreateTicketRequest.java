package com.relevantz.ticketservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.relevantz.ticketservice.model.Priority;

/**
 * INTEGRATED CreateTicketRequest.
 *
 * Replaces their simple version (subject, description, category, priority, requesterId).
 * Now carries the full hierarchy from our master-data-service:
 *   ServiceType → Category → SubCategory → Item → Priority → Project → Asset
 *
 * Supports both our frontend field names (requestedById/requestedByName)
 * and their frontend field names (requesterId/requesterName).
 */
public class CreateTicketRequest {

    // ── Requester ─────────────────────────────────────────────────────────────
    // Our frontend sends requestedById; their frontend sends requesterId.
    // getEffectiveRequesterId() returns whichever is set.
    private Long   requestedById;   // our frontend
    private Long   requesterId;     // their frontend (backward compat)
    private String requestedByName; // our frontend
    private String requesterName;   // their frontend (backward compat)

    // ── Service hierarchy (IDs from our master-data-service DB) ──────────────
    private Long    typeId;
    private String  typeName;
    private Integer categoryId;
    private String  category;           // human-readable category name
    private Integer subCategoryId;
    private String  subCategory;        // human-readable subcategory name
    private Integer itemId;
    private String  item;               // human-readable item name
    private Integer priorityId;         // FK → priority_sla table in our DB
    private String  priorityName;       // human-readable priority (HIGH, MEDIUM, …)

    // Their Priority enum — sent by their simple create form
    private Priority priority;

    // ── Ticket fields ─────────────────────────────────────────────────────────
    private String subject;
    private String description;

    // ── Optional fields ───────────────────────────────────────────────────────
    private Long    projectId;
    private Long    assetId;
    private String  asset;            // asset label for display
    private String  location;

//    @Pattern(regexp = "^[6-9][0-9]{9}$",
//             message = "Mobile must start with 6/7/8/9 and be exactly 10 digits")
    private String  mobileNumber;

    private String   attachmentName;
    private Long     attachmentSizeBytes;

    private String attachmentBase64;
    private String attachmentMimeType;
    //private LocalDate accessRequiredTill;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime accessRequiredTill;
    public CreateTicketRequest() {}

    // ── Helpers: resolve the correct requester fields ────────────────────────
    /** Returns requestedById if set, otherwise requesterId (their field). */
    public Long getEffectiveRequesterId() {
        return requestedById != null ? requestedById : requesterId;
    }
    /** Returns requestedByName if set, otherwise requesterName. */
    public String getEffectiveRequesterName() {
        return requestedByName != null ? requestedByName : requesterName;
    }
    /** Returns Priority enum — resolves from field or from priorityName string. */
    public Priority getEffectivePriority() {
        if (priority != null) return priority;
        if (priorityName != null) {
            try { return Priority.valueOf(priorityName.toUpperCase()); } catch (Exception ignored) {}
        }
        return Priority.MEDIUM; // safe default
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────
    public Long    getRequestedById()            { return requestedById; }
    public void    setRequestedById(Long v)      { this.requestedById = v; }
    public Long    getRequesterId()              { return requesterId; }
    public void    setRequesterId(Long v)        { this.requesterId = v; }
    public String  getRequestedByName()          { return requestedByName; }
    public void    setRequestedByName(String v)  { this.requestedByName = v; }
    public String  getRequesterName()            { return requesterName; }
    public void    setRequesterName(String v)    { this.requesterName = v; }
    public Long    getTypeId()                   { return typeId; }
    public void    setTypeId(Long v)             { this.typeId = v; }
    public String  getTypeName()                 { return typeName; }
    public void    setTypeName(String v)         { this.typeName = v; }
    public Integer getCategoryId()               { return categoryId; }
    public void    setCategoryId(Integer v)      { this.categoryId = v; }
    public String  getCategory()                 { return category; }
    public void    setCategory(String v)         { this.category = v; }
    public Integer getSubCategoryId()            { return subCategoryId; }
    public void    setSubCategoryId(Integer v)   { this.subCategoryId = v; }
    public String  getSubCategory()              { return subCategory; }
    public void    setSubCategory(String v)      { this.subCategory = v; }
    public Integer getItemId()                   { return itemId; }
    public void    setItemId(Integer v)          { this.itemId = v; }
    public String  getItem()                     { return item; }
    public void    setItem(String v)             { this.item = v; }
    public Integer getPriorityId()               { return priorityId; }
    public void    setPriorityId(Integer v)      { this.priorityId = v; }
    public String  getPriorityName()             { return priorityName; }
    public void    setPriorityName(String v)     { this.priorityName = v; }
    public Priority getPriority()                { return priority; }
    public void    setPriority(Priority v)       { this.priority = v; }
    public String  getSubject()                  { return subject; }
    public void    setSubject(String v)          { this.subject = v; }
    public String  getDescription()              { return description; }
    public void    setDescription(String v)      { this.description = v; }
    public Long    getProjectId()                { return projectId; }
    public void    setProjectId(Long v)          { this.projectId = v; }
    public Long    getAssetId()                  { return assetId; }
    public void    setAssetId(Long v)            { this.assetId = v; }
    public String  getAsset()                    { return asset; }
    public void    setAsset(String v)            { this.asset = v; }
    public String  getLocation()                 { return location; }
    public void    setLocation(String v)         { this.location = v; }
    public String  getMobileNumber()             { return mobileNumber; }
    public void    setMobileNumber(String v)     { this.mobileNumber = v; }
    public String  getAttachmentName()           { return attachmentName; }
    public void    setAttachmentName(String v)   { this.attachmentName = v; }
    public Long    getAttachmentSizeBytes()      { return attachmentSizeBytes; }
    public void    setAttachmentSizeBytes(Long v){ this.attachmentSizeBytes = v; }

	public LocalDateTime getAccessRequiredTill() {
		return accessRequiredTill;
	}

	public void setAccessRequiredTill(LocalDateTime accessRequiredTill) {
		this.accessRequiredTill = accessRequiredTill;
	}
	public String getAttachmentBase64()             { return attachmentBase64; }
	public void   setAttachmentBase64(String v)     { this.attachmentBase64 = v; }
	public String getAttachmentMimeType()           { return attachmentMimeType; }
	public void   setAttachmentMimeType(String v)   { this.attachmentMimeType = v; }
}
