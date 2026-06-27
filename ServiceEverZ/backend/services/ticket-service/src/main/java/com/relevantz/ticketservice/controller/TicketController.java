 package com.relevantz.ticketservice.controller;
 
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import com.relevantz.ticketservice.dto.SimilarTicketResponse;
import com.relevantz.ticketservice.dto.SlaResponse;
import com.relevantz.ticketservice.dto.SubmitTicketRequest;
import com.relevantz.ticketservice.dto.TicketResponse;
import com.relevantz.ticketservice.dto.UpdateTicketStatusRequest;
import com.relevantz.ticketservice.model.Ticket;
import com.relevantz.ticketservice.model.TicketStatus;
import com.relevantz.ticketservice.repository.TicketRepository;
import com.relevantz.ticketservice.service.OurTicketService;
import com.relevantz.ticketservice.service.SimilarTicketService;
import com.relevantz.ticketservice.service.TicketPdfService;
import com.relevantz.ticketservice.service.TicketService;

import jakarta.validation.Valid;
 
@RestController
@RequestMapping(value = "/api/tickets", produces = "application/json")
public class TicketController {
 
    private final TicketService service;
    private final OurTicketService ourService;
    private final TicketRepository ticketRepository;
    private final SimilarTicketService similarTicketService;
    private final TicketPdfService ticketPdfService;

    public TicketController(TicketService service, OurTicketService ourService,
                            TicketRepository ticketRepository,
                            SimilarTicketService similarTicketService,
                            TicketPdfService ticketPdfService) {
        this.service = service;
        this.ourService = ourService;
        this.ticketRepository = ticketRepository;
        this.similarTicketService = similarTicketService;
        this.ticketPdfService = ticketPdfService;
    }
 
    // =========================================================
    // OUR ENDPOINTS
    // =========================================================
 
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

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createAndSubmit(@RequestBody CreateTicketRequest req) {
        TicketResponse data = ourService.createAndSubmit(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ok("Ticket submitted — pending L1 approval", data));
    }
 
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<TicketResponse>> submitDraft(@Valid @RequestBody SubmitTicketRequest req) {
        TicketResponse data = ourService.submitDraft(req);
        return ResponseEntity.ok(ok("Draft submitted — pending L1 approval", data));
    }

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
     
    @PostMapping("/{id}/user-acknowledge")
    public ResponseEntity<ApiResponse<TicketResponse>> userAcknowledge(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long userId = body.get("userId") != null
                ? Long.parseLong(body.get("userId").toString()) : null;
        TicketResponse data = ourService.userAcknowledge(id, userId);
        return ResponseEntity.ok(ok("Acknowledgement recorded — support notified", data));
    }
 
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ok("Ticket Service running", "UP"));
    }
 
    // =========================================================
    // ORIGINAL ENDPOINTS
    // =========================================================
 
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

    // ✅ NEW — POST /{id}/history
    // Called by assignment-service (and can be called by any service) to write
    // a history row without needing direct DB access.
    // Body: { "status": "ASSIGNED", "remarks": "...", "changedBy": 0, "changedByName": "ITSM Manager" }
    @PostMapping("/{id}/history")
    public ResponseEntity<Void> addHistory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        String statusStr = body.get("status") != null
                ? body.get("status").toString().toUpperCase() : "OPEN";

        TicketStatus status;
        try {
            status = TicketStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            status = TicketStatus.OPEN;
        }

        Long changedBy = body.get("changedBy") instanceof Number n ? n.longValue() : 0L;
        String changedByName = body.get("changedByName") != null
                ? body.get("changedByName").toString() : "System";
        String remarks = body.get("remarks") != null
                ? body.get("remarks").toString() : "";

        service.addHistoryEntry(id, status, remarks, changedBy, changedByName);

        return ResponseEntity.ok().build();
    }
 
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,
            @RequestBody UpdateTicketStatusRequest req) {
        return ResponseEntity.ok(service.updateTicketStatus(id, req));
    }
 
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long assigneeId       = Long.valueOf(body.get("assigneeId").toString());
        String name           = body.getOrDefault("assigneeName", "").toString();
        String assignedByName = body.get("assignedByName") != null
                ? body.get("assignedByName").toString() : null;
        boolean isManual      = Boolean.TRUE.equals(body.get("isManual"))
                || "true".equalsIgnoreCase(String.valueOf(body.get("isManual")));
        return ResponseEntity.ok(service.assignTicket(id, assigneeId, name, assignedByName, isManual));
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
 
    // =========================================================
    // DUPLICATE WARNING — GET /api/tickets/similar
    // Called while the user types the ticket title.
    // Returns a list of similar OPEN tickets (no DB writes).
    // =========================================================

    @GetMapping("/similar")
    public ResponseEntity<ApiResponse<List<SimilarTicketResponse>>> getSimilarTickets(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subCategoryId,
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) Long itemId) {

        List<SimilarTicketResponse> matches =
                similarTicketService.findSimilar(title, categoryId, subCategoryId, typeId, itemId);
        return ResponseEntity.ok(ok("Similar tickets fetched", matches));
    }

    // =========================================================
    // TICKET PDF DOWNLOAD — GET /api/tickets/{id}/pdf
    // Generates and streams a structured PDF for the given ticket.
    // =========================================================

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadTicketPdf(@PathVariable Long id) {
        byte[] pdfBytes = ticketPdfService.generate(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ticket-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
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
