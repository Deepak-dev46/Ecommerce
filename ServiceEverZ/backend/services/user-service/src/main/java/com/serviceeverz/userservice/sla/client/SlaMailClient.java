// src/main/java/com/serviceeverz/userservice/sla/client/SlaMailClient.java
package com.serviceeverz.userservice.sla.client;
 
import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
 
/**
 * Feign client to send SLA breach notification emails via mail-service.
 * Mirrors the MailClient pattern from email-ticket-service.
 *
 * mail.service.url is already defined in application.yml:
 *   mail.service.url=http://localhost:8094
 */
@FeignClient(name = "sla-mail-client", url = "${mail.service.url}")
public interface SlaMailClient {
 
    @PostMapping("/api/mail/send")
    Map<String, Object> sendEmail(@RequestBody MailRequest request);
 
    class MailRequest {
        private String  to;
        private String  subject;
        private String  body;
        private boolean htmlBody;
 
        public MailRequest() {}
 
        public MailRequest(String to, String subject, String body, boolean htmlBody) {
            this.to       = to;
            this.subject  = subject;
            this.body     = body;
            this.htmlBody = htmlBody;
        }
 
        public String  getTo()                       { return to; }
        public void    setTo(String to)              { this.to = to; }
        public String  getSubject()                  { return subject; }
        public void    setSubject(String subject)    { this.subject = subject; }
        public String  getBody()                     { return body; }
        public void    setBody(String body)          { this.body = body; }
        public boolean isHtmlBody()                  { return htmlBody; }
        public void    setHtmlBody(boolean htmlBody) { this.htmlBody = htmlBody; }
    }
}
 