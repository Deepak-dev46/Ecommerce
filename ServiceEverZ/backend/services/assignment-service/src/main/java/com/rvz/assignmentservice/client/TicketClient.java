 //package com.rvz.assignmentservice.client;
// import org.springframework.cloud.openfeign.FeignClient;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PutMapping;
// import org.springframework.web.bind.annotation.RequestBody;
 

// import java.util.Map;

// @FeignClient(name = "ticket-service", url = "${ticket.service.url}")
// public interface TicketClient {
 
//     @GetMapping("/{ticketId}")
//     Map<String, Object> getTicketById(@PathVariable("ticketId") Long ticketId);
 
//     @PutMapping("/{ticketId}/assign")
//     Map<String, Object> assignTicket(
//         @PathVariable("ticketId") Long ticketId,
//         @RequestBody Map<String, Object> body
//     );
// }


package com.rvz.assignmentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "ticket-service", url = "${ticket.service.url}")
public interface TicketClient {

    @GetMapping("/{ticketId}")
    Map<String, Object> getTicketById(@PathVariable("ticketId") Long ticketId);

    // PUT /api/tickets/{ticketId}/assign — sets assignee_id + assignee_name in ticket table
    @PutMapping("/{ticketId}/assign")
    Map<String, Object> assignTicket(
        @PathVariable("ticketId") Long ticketId,
        @RequestBody Map<String, Object> body
    );
}
