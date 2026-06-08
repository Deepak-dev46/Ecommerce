package com.relevantz.ticketservice.client;

import com.relevantz.ticketservice.dto.ApprovalResponse;
import com.relevantz.ticketservice.dto.InitiateApprovalRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "approval-service", url = "${approval.service.base-url}")
public interface ApprovalClient {
	
    @PostMapping("/initiate")
    Object initiateApproval(@RequestBody InitiateApprovalRequest request);

    /**
     * Fetch the full approval record for a ticket from ticket_approvals table.
     * Returns a Map because the approval-service wraps in ApiResponse<ApprovalResponse>.
     */
    @GetMapping("/ticket/{ticketId}")
    Map<String, Object> getApprovalByTicket(@PathVariable("ticketId") Long ticketId);
}
