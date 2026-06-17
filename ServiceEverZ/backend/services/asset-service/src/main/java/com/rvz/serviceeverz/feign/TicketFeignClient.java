package com.rvz.serviceeverz.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.rvz.serviceeverz.dto.response.TicketResponse;
import com.rvz.serviceeverz.dto.response.TicketSummaryResponse;

@FeignClient(name = "ticket-service", url = "${ticket.service.url}")
public interface TicketFeignClient {

    /**
     * Fetches a ticket by ID from ticket-service.
     * Endpoint: GET /api/tickets/{id}
     * Returns the full ticket JSON mapped to TicketResponse.
     */
    @GetMapping("/api/tickets/{id}")
    TicketResponse getTicketById(@PathVariable("id") Long id);
    @GetMapping("/api/tickets/assigned")
    List<TicketSummaryResponse> getTicketsByAssignee(@RequestParam("assigneeId") Long assigneeId);
     
     
}