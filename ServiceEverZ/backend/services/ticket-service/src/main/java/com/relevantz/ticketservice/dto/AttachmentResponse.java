package com.relevantz.ticketservice.dto;


import com.relevantz.ticketservice.model.TicketAttachments;

public class AttachmentResponse {

    private String filename;
    private String file;

    public static AttachmentResponse from(TicketAttachments a) {
        AttachmentResponse r = new AttachmentResponse();
        r.filename = a.getFilename();
        r.file = a.getFile();
        return r;
    }

    public String getFilename() { return filename; }
    public String getFile() { return file; }
}