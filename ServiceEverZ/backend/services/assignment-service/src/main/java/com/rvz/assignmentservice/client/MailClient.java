package com.rvz.assignmentservice.client;

import com.rvz.assignmentservice.dto.request.EmailRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "mail-service", url = "${email.service.base-url}")
public interface MailClient {

    @PostMapping("/send")
    Object sendEmail(@RequestBody EmailRequest request);
}
