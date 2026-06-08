package com.rvz.serviceeverz.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.rvz.serviceeverz.dto.request.BulkMailRequest;
import com.rvz.serviceeverz.dto.request.MailRequest;

@FeignClient(name = "mail-service", url = "${mail.service.url}")
public interface MailServiceClient {

    /** Single targeted email — POST /api/mail/send */
    @PostMapping("/api/mail/send")
    void sendMail(@RequestBody MailRequest request);

    /** Bulk broadcast — POST /api/mail/send-bulk
     *  N recipients → 1 HTTP call → 1 SMTP connection in mail-service */
    @PostMapping("/api/mail/send-bulk")
    void sendBulkMail(@RequestBody BulkMailRequest request);
}
