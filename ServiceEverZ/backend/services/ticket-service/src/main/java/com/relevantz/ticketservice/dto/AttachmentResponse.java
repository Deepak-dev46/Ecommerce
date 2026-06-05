package com.relevantz.ticketservice.dto;
 
import com.relevantz.ticketservice.model.TicketAttachments;
 
public class AttachmentResponse {
 
    private Long   attachmentID;
    private String filename;
    private String mimeType;
    private String file;        // Base64 content — use in data URI on frontend
    private Long   fileSizeBytes;
 
    public static AttachmentResponse from(TicketAttachments a) {
        AttachmentResponse r = new AttachmentResponse();
        r.attachmentID   = a.getAttachmentID();
        r.filename       = a.getFilename();
        r.mimeType       = a.getMimeType();
        r.file           = a.getFile();
        r.fileSizeBytes  = a.getFileSizeBytes();
        return r;
    }
 
    public Long   getAttachmentID()  { return attachmentID; }
    public String getFilename()      { return filename; }
    public String getMimeType()      { return mimeType; }
    public String getFile()          { return file; }
    public Long   getFileSizeBytes() { return fileSizeBytes; }
}
 