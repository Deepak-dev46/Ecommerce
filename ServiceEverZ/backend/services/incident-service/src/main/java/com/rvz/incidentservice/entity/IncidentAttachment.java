package com.rvz.incidentservice.entity;

import jakarta.persistence.*;
 
@Entity
@Table(name = "incident_attachments")
public class IncidentAttachment {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "incident_id", nullable = false)
    private Long incidentId;
 
    @Column(name = "file_name")
    private String fileName;
 
    @Column(name = "file_type")
    private String fileType;
 
    @Column(name = "file_size")
    private Long fileSize;
 
    @Lob
    @Column(name = "file_data", columnDefinition = "LONGBLOB")
    private byte[] fileData;
 
    public IncidentAttachment() {}
 
    public Long getId()                    { return id; }
    public void setId(Long id)             { this.id = id; }
 
    public Long getIncidentId()            { return incidentId; }
    public void setIncidentId(Long v)      { this.incidentId = v; }
 
    public String getFileName()            { return fileName; }
    public void setFileName(String v)      { this.fileName = v; }
 
    public String getFileType()            { return fileType; }
    public void setFileType(String v)      { this.fileType = v; }
 
    public Long getFileSize()              { return fileSize; }
    public void setFileSize(Long v)        { this.fileSize = v; }
 
    public byte[] getFileData()            { return fileData; }
    public void setFileData(byte[] v)      { this.fileData = v; }
}
 