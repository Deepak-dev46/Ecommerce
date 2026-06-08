package com.relevantz.ticketservice.controller;
 
import java.util.List;
 
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
import com.relevantz.ticketservice.dto.AttachmentResponse;
import com.relevantz.ticketservice.repository.TicketAttachmentRepository;
 
@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {
 
    private final TicketAttachmentRepository attachmentRepository;
 
    public AttachmentController(TicketAttachmentRepository repo) {
        this.attachmentRepository = repo;
    }
 
    // GET /api/attachments/ticket/{ticketId}
    // Frontend renders: <img src={`data:${a.mimeType};base64,${a.file}`} />
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(
            @PathVariable Long ticketId) {
 
        List<AttachmentResponse> result = attachmentRepository
                .findByTicketId(ticketId)
                .stream()
                .map(AttachmentResponse::from)
                .toList();
 
        return ResponseEntity.ok(result);
    }
}
 