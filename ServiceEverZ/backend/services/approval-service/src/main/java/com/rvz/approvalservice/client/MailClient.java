package com.rvz.approvalservice.client;

import com.rvz.approvalservice.dto.request.EmailRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "mail-service", url = "${email.service.base-url}")
public interface MailClient {

    @PostMapping("/send")
    Object sendEmail(@RequestBody EmailRequest request);
}
