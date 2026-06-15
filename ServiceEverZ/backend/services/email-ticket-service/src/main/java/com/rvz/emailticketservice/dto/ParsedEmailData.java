package com.rvz.emailticketservice.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Carries every ticket-relevant field extracted from a single inbound email.
 * Fields mirror CreateTicketRequest in ticket-service exactly.
 */
public class ParsedEmailData {

    // ── From subject:  Category | SubCategory | RequesterName ─────────────
    private String category;
    private String subCategory;
    private String requesterName;

    // ── From email envelope ────────────────────────────────────────────────
    private String fromAddress;
    private String rawSubject;
    private String messageId;

    // ── Parsed from body key:value lines ──────────────────────────────────
    private String    employeeId;          // EmployeeId: 1001
    private String    project;             // Project: ProjectAlpha
    private String    item;                // Item: Software Access
    private String    priority;            // Priority: HIGH
    private String    location;            // Location: Chennai
    private String    description;         // Description: need git access
    private String    mobileNumber;        // MobileNumber: 9876543210
    private String    asset;               // Asset: LAPTOP-001
    private LocalDate accessRequiredTill;  // AccessRequiredTill: 2026-12-31

    // ── Attachments ────────────────────────────────────────────────────────
    private List<AttachmentData> attachments = new ArrayList<>();

    public ParsedEmailData() {}

    // ── Attachment inner class ─────────────────────────────────────────────
    public static class AttachmentData {
        private String filename;
        private byte[] content;
        private long   sizeBytes;
        private String contentType;

        public AttachmentData() {}

        public String  getFilename()                       { return filename; }
        public void    setFilename(String filename)        { this.filename = filename; }
        public byte[]  getContent()                        { return content; }
        public void    setContent(byte[] content)          { this.content = content; }
        public long    getSizeBytes()                      { return sizeBytes; }
        public void    setSizeBytes(long sizeBytes)        { this.sizeBytes = sizeBytes; }
        public String  getContentType()                    { return contentType; }
        public void    setContentType(String contentType)  { this.contentType = contentType; }
    }

    // ── Getters / Setters ──────────────────────────────────────────────────
    public String   getCategory()                        { return category; }
    public void     setCategory(String category)         { this.category = category; }

    public String   getSubCategory()                     { return subCategory; }
    public void     setSubCategory(String subCategory)   { this.subCategory = subCategory; }

    public String   getRequesterName()                   { return requesterName; }
    public void     setRequesterName(String n)           { this.requesterName = n; }

    public String   getFromAddress()                     { return fromAddress; }
    public void     setFromAddress(String fromAddress)   { this.fromAddress = fromAddress; }

    public String   getRawSubject()                      { return rawSubject; }
    public void     setRawSubject(String rawSubject)     { this.rawSubject = rawSubject; }

    public String   getMessageId()                       { return messageId; }
    public void     setMessageId(String messageId)       { this.messageId = messageId; }

    public String   getEmployeeId()                      { return employeeId; }
    public void     setEmployeeId(String employeeId)     { this.employeeId = employeeId; }

    public String   getProject()                         { return project; }
    public void     setProject(String project)           { this.project = project; }

    public String   getItem()                            { return item; }
    public void     setItem(String item)                 { this.item = item; }

    public String   getPriority()                        { return priority; }
    public void     setPriority(String priority)         { this.priority = priority; }

    public String   getLocation()                        { return location; }
    public void     setLocation(String location)         { this.location = location; }

    public String   getDescription()                     { return description; }
    public void     setDescription(String description)   { this.description = description; }

    public String   getMobileNumber()                    { return mobileNumber; }
    public void     setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String   getAsset()                           { return asset; }
    public void     setAsset(String asset)               { this.asset = asset; }

    public LocalDate getAccessRequiredTill()                   { return accessRequiredTill; }
    public void      setAccessRequiredTill(LocalDate d)        { this.accessRequiredTill = d; }

    public List<AttachmentData> getAttachments()               { return attachments; }
    public void setAttachments(List<AttachmentData> list)      { this.attachments = list; }
}
