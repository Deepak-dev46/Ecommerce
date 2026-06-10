package com.rvz.approvalservice.client;
 
import java.util.Map;
 
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
 
@FeignClient(name = "ticket-service", url = "${ticket.service.url}")
public interface TicketClient {
 
    @GetMapping("/api/tickets/{ticketId}")
    Map<String, Object> getTicketById(@PathVariable("ticketId") Long ticketId);
 
    
    // CORRECT:
    @PostMapping("/api/tickets/{ticketId}/allowUserReply")
    Boolean setAllowUserReply(
            @PathVariable("ticketId") Long ticketId,
            @RequestBody Map<String, Boolean> body
    );
     
    @PostMapping("/api/tickets/{ticketId}/comments")
    Map<String, Object> addComment(
            @PathVariable("ticketId") Long ticketId,
            @RequestBody Map<String, Object> body
    );
}
 