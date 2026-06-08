package com.relevantz.ticketservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.relevantz.ticketservice.model.ApprovalStatus;
import com.relevantz.ticketservice.model.TicketQueue;
import com.relevantz.ticketservice.repository.TicketQueueRepository;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    private final TicketQueueRepository queueRepository;

    public QueueController(TicketQueueRepository queueRepository) {
        this.queueRepository = queueRepository;
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<TicketQueue>> getQueue(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                queueRepository.findByTicketId(ticketId)
        );
    }

    @PatchMapping("/{queueId}")
    public ResponseEntity<TicketQueue> updateStatus(
            @PathVariable Long queueId,
            @RequestBody Map<String, String> body) {

        TicketQueue q = queueRepository.findById(queueId)
                .orElseThrow();

        q.setStatus(ApprovalStatus.valueOf(body.get("status")));
        q.setRemarks(body.get("remarks"));

        return ResponseEntity.ok(queueRepository.save(q));
    }
}
