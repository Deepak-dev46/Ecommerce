package com.rvz.emailticketservice.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** All data extracted from a raw inbound email. */
public class ParsedEmail {

    private String    messageId;
    private String    fromAddress;
    private String    rawSubject;

    // From subject line:  Category|SubCategory|FullName
    private String    category;
    private String    subCategory;
    private String    requesterName;

    // From body key-value pairs
    private String    employeeId;
    private String    project;
    private String    item;
    private String    priority;
    private String    location;
    private String    mobileNumber;
    private String    description;
    private LocalDate accessRequiredTill;

    private List<Attachment> attachments = new ArrayList<>();

    public static class Attachment {
        private String filename;
        private long   sizeBytes;
        public Attachment(String filename, long sizeBytes) {
            this.filename  = filename;
            this.sizeBytes = sizeBytes;
        }
        public String getFilename()  { return filename; }
        public long   getSizeBytes() { return sizeBytes; }
    }

    public String    getMessageId()                      { return messageId; }
    public void      setMessageId(String v)              { this.messageId = v; }
    public String    getFromAddress()                    { return fromAddress; }
    public void      setFromAddress(String v)            { this.fromAddress = v; }
    public String    getRawSubject()                     { return rawSubject; }
    public void      setRawSubject(String v)             { this.rawSubject = v; }
    public String    getCategory()                       { return category; }
    public void      setCategory(String v)               { this.category = v; }
    public String    getSubCategory()                    { return subCategory; }
    public void      setSubCategory(String v)            { this.subCategory = v; }
    public String    getRequesterName()                  { return requesterName; }
    public void      setRequesterName(String v)          { this.requesterName = v; }
    public String    getEmployeeId()                     { return employeeId; }
    public void      setEmployeeId(String v)             { this.employeeId = v; }
    public String    getProject()                        { return project; }
    public void      setProject(String v)                { this.project = v; }
    public String    getItem()                           { return item; }
    public void      setItem(String v)                   { this.item = v; }
    public String    getPriority()                       { return priority; }
    public void      setPriority(String v)               { this.priority = v; }
    public String    getLocation()                       { return location; }
    public void      setLocation(String v)               { this.location = v; }
    public String    getMobileNumber()                   { return mobileNumber; }
    public void      setMobileNumber(String v)           { this.mobileNumber = v; }
    public String    getDescription()                    { return description; }
    public void      setDescription(String v)            { this.description = v; }

    public LocalDate getAccessRequiredTill()             { return accessRequiredTill; }
    public void      setAccessRequiredTill(LocalDate v)  { this.accessRequiredTill = v; }
    public List<Attachment> getAttachments()             { return attachments; }
    public void      setAttachments(List<Attachment> v)  { this.attachments = v; }
}