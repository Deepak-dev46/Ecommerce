package com.rvz.serviceeverz.dto.request;

public class MailRequest {
    private String to, subject, body;
    private Boolean htmlBody;

    public MailRequest() {}
    public MailRequest(String to, String subject, String body, Boolean htmlBody) {
        this.to = to; this.subject = subject; this.body = body; this.htmlBody = htmlBody;
    }
    public String getTo() { return to; } public void setTo(String v) { to = v; }
    public String getSubject() { return subject; } public void setSubject(String v) { subject = v; }
    public String getBody() { return body; } public void setBody(String v) { body = v; }
    public Boolean getHtmlBody() { return htmlBody; } public void setHtmlBody(Boolean v) { htmlBody = v; }
}
