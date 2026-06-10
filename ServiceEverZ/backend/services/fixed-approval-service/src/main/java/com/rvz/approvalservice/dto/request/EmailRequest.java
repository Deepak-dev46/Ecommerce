package com.rvz.approvalservice.dto.request;

public class EmailRequest {
    private String to;
    private String subject;
    private String body;
    private boolean htmlBody;

    public EmailRequest() {}
    public EmailRequest(String to, String subject, String body, boolean htmlBody) {
        this.to = to;
        this.subject = subject;
        this.body = body;
        this.htmlBody = htmlBody;
    }
    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public boolean isHtmlBody() { return htmlBody; }
    public void setHtmlBody(boolean htmlBody) { this.htmlBody = htmlBody; }
}
