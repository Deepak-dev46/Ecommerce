package com.relevantz.ticketservice.controller;

import java.util.List;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.relevantz.ticketservice.model.TicketAttachments;
import com.relevantz.ticketservice.repository.TicketAttachmentRepository;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final TicketAttachmentRepository attachmentRepository;

    public AttachmentController(TicketAttachmentRepository repo) {
        this.attachmentRepository = repo;
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<TicketAttachments>> getAttachments(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                attachmentRepository.findByTicketId(ticketId)
        );
    }

    @PostMapping
    public ResponseEntity<TicketAttachments> upload(
            @RequestBody TicketAttachments attachment) {

        return ResponseEntity.status(HttpStatus.SC_CREATED)
                .body(attachmentRepository.save(attachment));
    }
}
