package com.rvz.emailticketservice.client;

import com.rvz.emailticketservice.dto.request.EmailTicketRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * Feign client for ticket-service.
 * Calls POST /api/tickets/create-submit to create and submit the ticket.
 */
@FeignClient(name = "ticket-service-email", url = "${ticket.service.url}")
public interface TicketClient {

    @PostMapping("/api/tickets")
    Map<String, Object> createAndSubmitTicket(@RequestBody EmailTicketRequest request);
}
