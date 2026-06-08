package com.relevantz.ticketservice.service;

import org.springframework.stereotype.Service;

import com.relevantz.ticketservice.model.TicketItemTimePeriod;
import com.relevantz.ticketservice.repository.TicketItemTimePeriodRepository;

@Service
public class TimePeriodService {

    private final TicketItemTimePeriodRepository repo;

    public TimePeriodService(TicketItemTimePeriodRepository repo) {
        this.repo = repo;
    }

    public TicketItemTimePeriod getTimePeriod(Long ticketId) {
        return repo.findByTicketId(ticketId);
    }

    public TicketItemTimePeriod save(TicketItemTimePeriod t) {
        return repo.save(t);
    }
}
