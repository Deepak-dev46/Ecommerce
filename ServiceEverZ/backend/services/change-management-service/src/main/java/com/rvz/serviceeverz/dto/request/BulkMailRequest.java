package com.rvz.serviceeverz.dto.request;
import java.util.List;

public class BulkMailRequest {
    private List<String> recipients;
    private String subject, body;
    private Boolean htmlBody;

    public BulkMailRequest() {}
    public BulkMailRequest(List<String> recipients, String subject, String body, Boolean htmlBody) {
        this.recipients = recipients; this.subject = subject; this.body = body; this.htmlBody = htmlBody;
    }
    public List<String> getRecipients() { return recipients; } public void setRecipients(List<String> v) { recipients = v; }
    public String getSubject() { return subject; } public void setSubject(String v) { subject = v; }
    public String getBody() { return body; } public void setBody(String v) { body = v; }
    public Boolean getHtmlBody() { return htmlBody; } public void setHtmlBody(Boolean v) { htmlBody = v; }
}
