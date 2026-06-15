package com.relevantz.ticketservice.controller;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.relevantz.ticketservice.model.TicketItemTimePeriod;
import com.relevantz.ticketservice.repository.TicketItemTimePeriodRepository;

@RestController
@RequestMapping("/api/time-period")
public class TimePeriodController {

    private final TicketItemTimePeriodRepository repo;

    public TimePeriodController(TicketItemTimePeriodRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<TicketItemTimePeriod> getTimePeriod(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                repo.findByTicketId(ticketId)
        );
    }

    @PostMapping
    public ResponseEntity<TicketItemTimePeriod> save(
            @RequestBody TicketItemTimePeriod t) {

        return ResponseEntity.status(HttpStatus.SC_CREATED)
                .body(repo.save(t));
    }
}
