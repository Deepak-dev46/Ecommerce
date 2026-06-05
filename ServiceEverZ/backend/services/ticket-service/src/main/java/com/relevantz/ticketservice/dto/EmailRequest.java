package com.relevantz.ticketservice.dto;

public class EmailRequest {
    private String to;
    private String subject;
    private String body;
    private boolean html;

    public EmailRequest() {}
    public EmailRequest(String to, String subject, String body, boolean html) {
        this.to = to; this.subject = subject; this.body = body; this.html = html;
    }
    public String getTo()           { return to; }
    public void setTo(String v)     { this.to = v; }
    public String getSubject()      { return subject; }
    public void setSubject(String v){ this.subject = v; }
    public String getBody()         { return body; }
    public void setBody(String v)   { this.body = v; }
    public boolean isHtml()         { return html; }
    public void setHtml(boolean v)  { this.html = v; }
}
