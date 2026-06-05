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

import com.relevantz.ticketservice.dto.AddCommentRequest;
import com.relevantz.ticketservice.dto.CommentResponse;
import com.relevantz.ticketservice.service.TicketService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final TicketService ticketService;

    public CommentController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(ticketService.getComments(ticketId));
    }

    @PostMapping("/ticket/{ticketId}")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long ticketId,
            @RequestBody AddCommentRequest req) {

        return ResponseEntity.status(HttpStatus.SC_CREATED)
                .body(ticketService.addComment(ticketId, req));
    }
}
