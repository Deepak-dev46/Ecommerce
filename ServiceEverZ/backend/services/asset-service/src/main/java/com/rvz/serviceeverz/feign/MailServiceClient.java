package com.rvz.serviceeverz.feign;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.rvz.serviceeverz.dto.response.ApiResponse;
 
@FeignClient(name = "mail-service", url = "${mail.service.url}")
public interface MailServiceClient {
 
    @PostMapping("/api/mail/send")
    ApiResponse<String> sendMail(@RequestBody MailRequest request);
 
    class MailRequest {
        private String to;
        private String subject;
        private String body;
        private boolean htmlBody;
        // 'from' is NOT sent — mail service always uses its configured Gmail account
		public String getTo() {
			return to;
		}
		public void setTo(String to) {
			this.to = to;
		}
		public String getSubject() {
			return subject;
		}
		public void setSubject(String subject) {
			this.subject = subject;
		}
		public String getBody() {
			return body;
		}
		public void setBody(String body) {
			this.body = body;
		}
		public boolean isHtmlBody() {
			return htmlBody;
		}
		public void setHtmlBody(boolean htmlBody) {
			this.htmlBody = htmlBody;
		}
		public MailRequest(String to, String subject, String body, boolean htmlBody) {
			super();
			this.to = to;
			this.subject = subject;
			this.body = body;
			this.htmlBody = htmlBody;
		}
 
     
    }
}
 