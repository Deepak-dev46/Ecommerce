package com.rvz.emailticketservice.controller;

import com.rvz.emailticketservice.service.impl.EmailTicketServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Manual trigger endpoint for testing — polls inbox on demand. */
@RestController
@RequestMapping("/api/email-ticket")
@CrossOrigin(origins = "*")
public class EmailTicketController {

    private final EmailTicketServiceImpl service;

    public EmailTicketController(EmailTicketServiceImpl service) {
        this.service = service;
    }

    /** POST /api/email-ticket/poll — manually trigger inbox poll */
    @PostMapping("/poll")
    public ResponseEntity<Map<String, String>> poll() {
        service.pollInbox();
        return ResponseEntity.ok(Map.of("status", "poll complete"));
    }

    /** GET /api/email-ticket/health */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "email-ticket-service"));
    }
}