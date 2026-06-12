// package com.relevantz.ticketservice.controller;
 
// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Map;
 
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PatchMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.PutMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
 
// import com.relevantz.ticketservice.dto.AddCommentRequest;
// import com.relevantz.ticketservice.dto.ApiResponse;
// import com.relevantz.ticketservice.dto.CancelTicketRequest;
// import com.relevantz.ticketservice.dto.CommentResponse;
// import com.relevantz.ticketservice.dto.CreateTicketRequest;
// import com.relevantz.ticketservice.dto.HistoryResponse;
// import com.relevantz.ticketservice.dto.ReopenTicketRequest;
// import com.relevantz.ticketservice.dto.SlaResponse;
// import com.relevantz.ticketservice.dto.SubmitTicketRequest;
// import com.relevantz.ticketservice.dto.TicketResponse;
// import com.relevantz.ticketservice.dto.UpdateTicketStatusRequest;
// import com.relevantz.ticketservice.model.Ticket;
// import com.relevantz.ticketservice.repository.TicketRepository;
// import com.relevantz.ticketservice.service.OurTicketService;
// import com.relevantz.ticketservice.service.TicketService;
 
// import jakarta.validation.Valid;
 
// /**
//  * INTEGRATED TicketController — package com.relevantz.ticketservice.controller
//  *
//  * OUR new/replaced endpoints: POST /api/tickets ← REPLACED: now uses our
//  * createAndSubmit (full approval flow) POST /api/tickets/draft ← NEW: save as
//  * draft without approval POST /api/tickets/submit ← NEW: submit an existing
//  * draft GET /api/tickets/user-tickets ← NEW: my tickets with L1/L2 approval
//  * queue status GET /api/tickets/health ← NEW: health check
//  *
//  * THEIR original endpoints (ALL UNCHANGED): GET /api/tickets/allTickets GET
//  * /api/tickets/allowUserReply/{id} GET /api/tickets/my GET
//  * /api/tickets/assigned GET /api/tickets/{id} POST /api/tickets/{id}/comments
//  * GET /api/tickets/{id}/comments GET /api/tickets/{id}/history PATCH
//  * /api/tickets/{id}/status PUT /api/tickets/{id}/assign GET
//  * /api/tickets/{id}/sla POST /api/tickets/{id}/reopen POST
//  * /api/tickets/{id}/cancel POST /api/tickets/{id}/pause POST
//  * /api/tickets/{id}/resume GET /api/tickets/getAssignee/{id}
//  */
// @RestController
// @RequestMapping(value = "/api/tickets", produces = "application/json")
// public class TicketController {
 
//     private final TicketService service; // their service (status, assign, comments…)
//     private final OurTicketService ourService; // our service (create, draft, submit…)
//     private final TicketRepository ticketRepository;
//     public TicketController(TicketService service, OurTicketService ourService, TicketRepository ticketRepository) {
//         this.service = service;
//         this.ourService = ourService;
//         this.ticketRepository = ticketRepository;
//     }
 
//     /*
//      * ========================================================= OUR ENDPOINTS
//      * =========================================================
//      */
 
//     /**
//      * Save as draft — no approval triggered, no queue created. Frontend: "Save as
//      * Draft" button in our CreateTicketPage.
//      */
//     @PostMapping("/draft")
//     public ResponseEntity<ApiResponse<TicketResponse>> saveDraft(@RequestBody CreateTicketRequest req) {
//         TicketResponse data = ourService.saveDraft(req);
//         return ResponseEntity.status(HttpStatus.CREATED).body(ok("Draft saved successfully", data));
//     }
 
//     @GetMapping("/my-drafts")
//     public ResponseEntity<?> getDraftsByUser(@RequestParam Long userId) {
//         List<Ticket> drafts = ticketRepository.findByUserIdAndDraftTrue(userId);
//         return ResponseEntity.ok(drafts);
//     }
   
//     @PutMapping("/draft/{ticketId}")
//     public ResponseEntity<ApiResponse<TicketResponse>> updateDraft(@PathVariable Long ticketId,
//             @RequestBody CreateTicketRequest req) {
//         TicketResponse data = ourService.updateDraft(ticketId, req);
//         return ResponseEntity.ok(ok("Draft updated successfully", data));
//     }
 
//     /**
//      * Create + Submit — replaces their simple createTicket. Creates ticket → L1/L2
//      * queue entries → calls approval-service → sends email. Frontend: "Submit"
//      * button in our CreateTicketPage (POST /api/tickets).
//      */
//     @PostMapping
//     public ResponseEntity<ApiResponse<TicketResponse>> createAndSubmit(@RequestBody CreateTicketRequest req) {
//         TicketResponse data = ourService.createAndSubmit(req);
//         return ResponseEntity.status(HttpStatus.CREATED).body(ok("Ticket submitted — pending L1 approval", data));
//     }
 
//     /**
//      * Submit an existing draft. Frontend: "Submit Draft" button.
//      */
//     @PostMapping("/submit")
//     public ResponseEntity<ApiResponse<TicketResponse>> submitDraft(@Valid @RequestBody SubmitTicketRequest req) {
//         TicketResponse data = ourService.submitDraft(req);
//         return ResponseEntity.ok(ok("Draft submitted — pending L1 approval", data));
//     }
//     /**
//      * POST /api/tickets/{id}/resolve
//      * Body: { "resolutionMessage": "...", "supportPersonId": 5 }
//      * Support personnel resolves ticket with a message.
//      * Status → PENDING_USER_ACK. Emails the requester.
//      */
 
     
//     /**
//      * My Tickets with approval status (for our frontend pages). URL: GET
//      * /api/tickets/user-tickets?userId=X Returns TicketResponse[] including queue[]
//      * with L1/L2 status.
//      */
//     @GetMapping("/user-tickets")
//     public ResponseEntity<ApiResponse<List<TicketResponse>>> getUserTickets(@RequestParam Long userId) {
//         List<TicketResponse> data = ourService.getTicketsByUser(userId);
//         return ResponseEntity.ok(ok("Tickets fetched", data));
//     }
   
//     @PostMapping("/{id}/resolve")
//     public ResponseEntity<ApiResponse<TicketResponse>> resolveTicket(
//             @PathVariable Long id,
//             @RequestBody Map<String, Object> body) {
//         String resolutionMessage = (String) body.get("resolutionMessage");
//         Long supportPersonId = body.get("supportPersonId") != null
//                 ? Long.parseLong(body.get("supportPersonId").toString()) : null;
//         if (resolutionMessage == null || resolutionMessage.isBlank()) {
//             ApiResponse<TicketResponse> err = new ApiResponse<>();
//             err.setSuccess(false); err.setMessage("Resolution message is required");
//             err.setTimestamp(LocalDateTime.now());
//             return ResponseEntity.badRequest().body(err);
//         }
//         TicketResponse data = ourService.resolveTicket(id, resolutionMessage, supportPersonId);
//         return ResponseEntity.ok(ok("Ticket resolved — user notified", data));
//     }
     
//     /**
//      * POST /api/tickets/{id}/user-acknowledge
//      * Body: { "userId": 4 }
//      * End user acknowledges the resolution.
//      * Status → RESOLVED. Emails the support person.
//      */
//     @PostMapping("/{id}/user-acknowledge")
//     public ResponseEntity<ApiResponse<TicketResponse>> userAcknowledge(
//             @PathVariable Long id,
//             @RequestBody Map<String, Object> body) {
//         Long userId = body.get("userId") != null
//                 ? Long.parseLong(body.get("userId").toString()) : null;
//         TicketResponse data = ourService.userAcknowledge(id, userId);
//         return ResponseEntity.ok(ok("Acknowledgement recorded — support notified", data));
//     }
 
//     /** Simple health check */
//     @GetMapping("/health")
//     public ResponseEntity<ApiResponse<String>> health() {
//         return ResponseEntity.ok(ok("Ticket Service running", "UP"));
//     }
 
//     /*
//      * ========================================================= THEIR ORIGINAL
//      * ENDPOINTS — ALL UNCHANGED
//      * =========================================================
//      */
 
//     @GetMapping("/getAssignee/{id}")
//     public String getNameByAssigneeId(@PathVariable long id) {
//         return service.getNameByAssigneeId(id);
//     }
 
//     @GetMapping("/allTickets")
//     public ResponseEntity<List<TicketResponse>> getAllTickets() {
//         return ResponseEntity.ok(service.getAllTickets());
//     }
 
//     @GetMapping("/allowUserReply/{id}")
//     public ResponseEntity<Boolean> getAllowUserReply(@PathVariable Long id) {
//         return ResponseEntity.ok(service.allowUserReply(id));
//     }
 
//     @PatchMapping("/{id}/allowUserReply")
//     public ResponseEntity<Boolean> updateAllowUserReply(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
 
//         Boolean allow = body.get("allowUserReply");
 
//         return ResponseEntity.ok(service.updateAllowUserReply(id, allow));
//     }
 
//     /**
//      * Their My Tickets (returns TicketResponse directly, not wrapped in
//      * ApiResponse).
//      */
//     @GetMapping("/my")
//     public ResponseEntity<List<TicketResponse>> getMyTickets(@RequestParam Long userId) {
//         return ResponseEntity.ok(service.getMyTickets(userId));
//     }
 
//     @GetMapping("/assigned")
//     public ResponseEntity<List<TicketResponse>> getAssignedTickets(@RequestParam Long assigneeId) {
//         return ResponseEntity.ok(service.getAssignedTickets(assigneeId));
//     }
 
//     @GetMapping("/{id}")
//     public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
//         return ResponseEntity.ok(service.getTicketById(id));
//     }
 
//     @PostMapping("/{id}/comments")
//     public ResponseEntity<CommentResponse> addComment(@PathVariable Long id,
//             @Valid @RequestBody AddCommentRequest req) {
//         return ResponseEntity.ok(service.addComment(id, req));
//     }
 
//     @GetMapping("/{id}/comments")
//     public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
//         return ResponseEntity.ok(service.getComments(id));
//     }
 
//     @GetMapping("/{id}/history")
//     public ResponseEntity<List<HistoryResponse>> getHistory(@PathVariable Long id) {
//         return ResponseEntity.ok(service.getHistory(id));
//     }
 
//     @PatchMapping("/{id}/status")
//     public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,
//             @RequestBody UpdateTicketStatusRequest req) {
//         return ResponseEntity.ok(service.updateTicketStatus(id, req));
//     }
 
//     @PutMapping("/{id}/assign")
//     public ResponseEntity<TicketResponse> assignTicket(@PathVariable Long id, @RequestBody Map<String, Object> body) {
//         Long assigneeId = Long.valueOf(body.get("assigneeId").toString());
//         String name = body.getOrDefault("assigneeName", "").toString();
//         return ResponseEntity.ok(service.assignTicket(id, assigneeId, name));
//     }
 
//     @GetMapping("/{id}/sla")
//     public ResponseEntity<SlaResponse> getSla(@PathVariable Long id) {
//         return ResponseEntity.ok(service.getTicketSla(id));
//     }
 
//     @PostMapping("/{id}/reopen")
//     public ResponseEntity<TicketResponse> reopenTicket(@PathVariable Long id,
//             @Valid @RequestBody ReopenTicketRequest req) {
//         return ResponseEntity.ok(service.reopenTicket(id, req));
//     }
 
//     @PostMapping("/{id}/cancel")
//     public ResponseEntity<TicketResponse> cancelTicket(@PathVariable Long id,
//             @Valid @RequestBody CancelTicketRequest req) {
//         return ResponseEntity.ok(service.cancelTicket(id, req));
//     }
 
//     @PostMapping("/{id}/pause")
//     public ResponseEntity<TicketResponse> pauseTicket(@PathVariable Long id,
//             @RequestBody UpdateTicketStatusRequest req) {
//         return ResponseEntity.ok(service.pauseTicket(id, req));
//     }
 
//     @PostMapping("/{id}/resume")
//     public ResponseEntity<TicketResponse> resumeTicket(@PathVariable Long id,
//             @RequestBody UpdateTicketStatusRequest req) {
//         return ResponseEntity.ok(service.resumeTicket(id, req));
//     }
 
   
//     private <T> ApiResponse<T> ok(String message, T data) {
//         ApiResponse<T> r = new ApiResponse<>();
//         r.setSuccess(true);
//         r.setMessage(message);
//         r.setData(data);
//         r.setTimestamp(LocalDateTime.now());
//         return r;
//     }
// }
 
 package com.relevantz.ticketservice.controller;
 
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.relevantz.ticketservice.dto.AddCommentRequest;
import com.relevantz.ticketservice.dto.ApiResponse;
import com.relevantz.ticketservice.dto.CancelTicketRequest;
import com.relevantz.ticketservice.dto.CommentResponse;
import com.relevantz.ticketservice.dto.CreateTicketRequest;
import com.relevantz.ticketservice.dto.HistoryResponse;
import com.relevantz.ticketservice.dto.ReopenTicketRequest;
import com.relevantz.ticketservice.dto.SlaResponse;
import com.relevantz.ticketservice.dto.SubmitTicketRequest;
import com.relevantz.ticketservice.dto.TicketResponse;
import com.relevantz.ticketservice.dto.UpdateTicketStatusRequest;
import com.relevantz.ticketservice.model.Ticket;
import com.relevantz.ticketservice.repository.TicketRepository;
import com.relevantz.ticketservice.service.OurTicketService;
import com.relevantz.ticketservice.service.TicketService;

import jakarta.validation.Valid;
 
/**
 * INTEGRATED TicketController — package com.relevantz.ticketservice.controller
 *
 * OUR new/replaced endpoints: POST /api/tickets ← REPLACED: now uses our
 * createAndSubmit (full approval flow) POST /api/tickets/draft ← NEW: save as
 * draft without approval POST /api/tickets/submit ← NEW: submit an existing
 * draft GET /api/tickets/user-tickets ← NEW: my tickets with L1/L2 approval
 * queue status GET /api/tickets/health ← NEW: health check
 *
 * THEIR original endpoints (ALL UNCHANGED): GET /api/tickets/allTickets GET
 * /api/tickets/allowUserReply/{id} GET /api/tickets/my GET
 * /api/tickets/assigned GET /api/tickets/{id} POST /api/tickets/{id}/comments
 * GET /api/tickets/{id}/comments GET /api/tickets/{id}/history PATCH
 * /api/tickets/{id}/status PUT /api/tickets/{id}/assign GET
 * /api/tickets/{id}/sla POST /api/tickets/{id}/reopen POST
 * /api/tickets/{id}/cancel POST /api/tickets/{id}/pause POST
 * /api/tickets/{id}/resume GET /api/tickets/getAssignee/{id}
 */
@RestController
@RequestMapping(value = "/api/tickets", produces = "application/json")
public class TicketController {
 
    private final TicketService service; // their service (status, assign, comments…)
    private final OurTicketService ourService; // our service (create, draft, submit…)
    private final TicketRepository ticketRepository;
    public TicketController(TicketService service, OurTicketService ourService, TicketRepository ticketRepository) {
        this.service = service;
        this.ourService = ourService;
        this.ticketRepository = ticketRepository;
    }
 
    /*
     * ========================================================= OUR ENDPOINTS
     * =========================================================
     */
 
    /**
     * Save as draft — no approval triggered, no queue created. Frontend: "Save as
     * Draft" button in our CreateTicketPage.
     */
    @PostMapping("/draft")
    public ResponseEntity<ApiResponse<TicketResponse>> saveDraft(@RequestBody CreateTicketRequest req) {
        TicketResponse data = ourService.saveDraft(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ok("Draft saved successfully", data));
    }
 
    
    @GetMapping("/my-drafts")
    public ResponseEntity<?> getDraftsByUser(@RequestParam Long userId) {
        List<Ticket> drafts = ticketRepository.findByUserIdAndDraftTrue(userId);
        return ResponseEntity.ok(drafts);
    }
   
    @PutMapping("/draft/{ticketId}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateDraft(@PathVariable Long ticketId,
            @RequestBody CreateTicketRequest req) {
        TicketResponse data = ourService.updateDraft(ticketId, req);
        return ResponseEntity.ok(ok("Draft updated successfully", data));
    }
 
    @DeleteMapping("/draft/{ticketId}")
    public ResponseEntity<ApiResponse<Void>> deleteDraft(@PathVariable Long ticketId) {
        ourService.deleteDraft(ticketId);
        return ResponseEntity.ok(ok("Draft deleted successfully", null));
    }
    /**
     * Create + Submit — replaces their simple createTicket. Creates ticket → L1/L2
     * queue entries → calls approval-service → sends email. Frontend: "Submit"
     * button in our CreateTicketPage (POST /api/tickets).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createAndSubmit(@RequestBody CreateTicketRequest req) {
        TicketResponse data = ourService.createAndSubmit(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ok("Ticket submitted — pending L1 approval", data));
    }
 
    /**
     * Submit an existing draft. Frontend: "Submit Draft" button.
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<TicketResponse>> submitDraft(@Valid @RequestBody SubmitTicketRequest req) {
        TicketResponse data = ourService.submitDraft(req);
        return ResponseEntity.ok(ok("Draft submitted — pending L1 approval", data));
    }
    /**
     * POST /api/tickets/{id}/resolve
     * Body: { "resolutionMessage": "...", "supportPersonId": 5 }
     * Support personnel resolves ticket with a message.
     * Status → PENDING_USER_ACK. Emails the requester.
     */
 
     
    /**
     * My Tickets with approval status (for our frontend pages). URL: GET
     * /api/tickets/user-tickets?userId=X Returns TicketResponse[] including queue[]
     * with L1/L2 status.
     */
    @GetMapping("/user-tickets")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getUserTickets(@RequestParam Long userId) {
        List<TicketResponse> data = ourService.getTicketsByUser(userId);
        return ResponseEntity.ok(ok("Tickets fetched", data));
    }
   
    @PostMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<TicketResponse>> resolveTicket(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String resolutionMessage = (String) body.get("resolutionMessage");
        Long supportPersonId = body.get("supportPersonId") != null
                ? Long.parseLong(body.get("supportPersonId").toString()) : null;
        // ✅ FIX: Also extract supportPersonName so history shows real agent name
        String supportPersonName = body.get("supportPersonName") != null
                ? body.get("supportPersonName").toString() : null;
        if (resolutionMessage == null || resolutionMessage.isBlank()) {
            ApiResponse<TicketResponse> err = new ApiResponse<>();
            err.setSuccess(false); err.setMessage("Resolution message is required");
            err.setTimestamp(LocalDateTime.now());
            return ResponseEntity.badRequest().body(err);
        }
        TicketResponse data = ourService.resolveTicket(id, resolutionMessage, supportPersonId, supportPersonName);
        return ResponseEntity.ok(ok("Ticket resolved — user notified", data));
    }
     
    /**
     * POST /api/tickets/{id}/user-acknowledge
     * Body: { "userId": 4 }
     * End user acknowledges the resolution.
     * Status → RESOLVED. Emails the support person.
     */
    @PostMapping("/{id}/user-acknowledge")
    public ResponseEntity<ApiResponse<TicketResponse>> userAcknowledge(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long userId = body.get("userId") != null
                ? Long.parseLong(body.get("userId").toString()) : null;
        TicketResponse data = ourService.userAcknowledge(id, userId);
        return ResponseEntity.ok(ok("Acknowledgement recorded — support notified", data));
    }
 
    /** Simple health check */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ok("Ticket Service running", "UP"));
    }
 
    /*
     * ========================================================= THEIR ORIGINAL
     * ENDPOINTS — ALL UNCHANGED
     * =========================================================
     */
 
    @GetMapping("/getAssignee/{id}")
    public String getNameByAssigneeId(@PathVariable long id) {
        return service.getNameByAssigneeId(id);
    }
 
    @GetMapping("/allTickets")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(service.getAllTickets());
    }
 
    @GetMapping("/allowUserReply/{id}")
    public ResponseEntity<Boolean> getAllowUserReply(@PathVariable Long id) {
        return ResponseEntity.ok(service.allowUserReply(id));
    }
 
    @PatchMapping("/{id}/allowUserReply")
    public ResponseEntity<Boolean> updateAllowUserReply(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
 
        Boolean allow = body.get("allowUserReply");
 
        return ResponseEntity.ok(service.updateAllowUserReply(id, allow));
    }
 
    @PostMapping("/{id}/allowUserReply")
    public ResponseEntity<Boolean> setAllowUserReplyPost(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean allow = body.get("allowUserReply");
        return ResponseEntity.ok(service.updateAllowUserReply(id, allow));
    }
     
    /**
     * Their My Tickets (returns TicketResponse directly, not wrapped in
     * ApiResponse).
     */
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getMyTickets(userId));
    }
 
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(@RequestParam Long assigneeId) {
        return ResponseEntity.ok(service.getAssignedTickets(assigneeId));
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTicketById(id));
    }
 
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id,
            @Valid @RequestBody AddCommentRequest req) {
        return ResponseEntity.ok(service.addComment(id, req));
    }
 
    @GetMapping("/{id}/comments/channel/{channel}")
    public ResponseEntity<List<CommentResponse>> getCommentsByChannel(
            @PathVariable Long id,
            @PathVariable String channel) {
        return ResponseEntity.ok(service.getCommentsByChannel(id, channel));
    }
     
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(service.getComments(id));
    }
 
    @GetMapping("/{id}/history")
    public ResponseEntity<List<HistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(service.getHistory(id));
    }
 
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,
            @RequestBody UpdateTicketStatusRequest req) {
        return ResponseEntity.ok(service.updateTicketStatus(id, req));
    }
 
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long assigneeId = Long.valueOf(body.get("assigneeId").toString());
        String name = body.getOrDefault("assigneeName", "").toString();
        return ResponseEntity.ok(service.assignTicket(id, assigneeId, name));
    }
 
    @GetMapping("/{id}/sla")
    public ResponseEntity<SlaResponse> getSla(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTicketSla(id));
    }
 
    @PostMapping("/{id}/reopen")
    public ResponseEntity<TicketResponse> reopenTicket(@PathVariable Long id,
            @Valid @RequestBody ReopenTicketRequest req) {
        return ResponseEntity.ok(service.reopenTicket(id, req));
    }
 
    @PostMapping("/{id}/cancel")
    public ResponseEntity<TicketResponse> cancelTicket(@PathVariable Long id,
            @Valid @RequestBody CancelTicketRequest req) {
        return ResponseEntity.ok(service.cancelTicket(id, req));
    }
 
    @PostMapping("/{id}/pause")
    public ResponseEntity<TicketResponse> pauseTicket(@PathVariable Long id,
            @RequestBody UpdateTicketStatusRequest req) {
        return ResponseEntity.ok(service.pauseTicket(id, req));
    }
 
    @PostMapping("/{id}/resume")
    public ResponseEntity<TicketResponse> resumeTicket(@PathVariable Long id,
            @RequestBody UpdateTicketStatusRequest req) {
        return ResponseEntity.ok(service.resumeTicket(id, req));
    }
 
   
    private <T> ApiResponse<T> ok(String message, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setSuccess(true);
        r.setMessage(message);
        r.setData(data);
        r.setTimestamp(LocalDateTime.now());
        return r;
    }
}
 