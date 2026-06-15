package com.rvz.incidentservice.client;

import com.rvz.incidentservice.dto.request.EmailRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for mail-service.
 * Sends confirmation emails to the incident requester on creation.
 */
@FeignClient(name = "mail-service", url = "${mail.service.base-url}")
public interface MailClient {

    @PostMapping("/send")
    Object sendEmail(@RequestBody EmailRequest request);
}
