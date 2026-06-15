package com.relevantz.ticketservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.relevantz.ticketservice.dto.HistoryResponse;
import com.relevantz.ticketservice.service.TicketService;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final TicketService ticketService;

    public HistoryController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<HistoryResponse>> getHistory(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(ticketService.getHistory(ticketId));
    }
}