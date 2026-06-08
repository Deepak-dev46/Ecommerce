package com.rvz.actionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

/**
 * Feign client for ticket-service.
 * Used to look up ticket details (requestedById) so the action-service
 * can resolve the real requester email via master-data-service.
 */
@FeignClient(name = "ticket-service-action", url = "${ticket.service.url}")
public interface TicketClient {

    @GetMapping("/{ticketId}")
    Map<String, Object> getTicketById(@PathVariable("ticketId") Long ticketId);
}
