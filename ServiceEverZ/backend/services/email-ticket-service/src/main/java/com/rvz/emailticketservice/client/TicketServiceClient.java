package com.rvz.emailticketservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

/**
 * Calls ticket-service via API gateway (port 8080).
 * POST /api/tickets  →  createAndSubmit()
 * Full flow: ticket saved → L1/L2 approval triggered → assignment → support ack
 */
@FeignClient(name = "email-ticket-svc", url = "${ticket.service.url}")
public interface TicketServiceClient {
    @PostMapping("/api/tickets")
    Map<String, Object> createAndSubmit(@RequestBody Map<String, Object> request);
}