package com.relevantz.ticketservice.client;

import com.relevantz.ticketservice.dto.EmailRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "mail-service", url = "${mail.service.base-url}")
public interface MailClient {

    @PostMapping("/send")
    Object sendEmail(@RequestBody EmailRequest request);
}
