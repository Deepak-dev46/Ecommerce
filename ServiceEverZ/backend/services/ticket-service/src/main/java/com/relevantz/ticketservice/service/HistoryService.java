package com.relevantz.ticketservice.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.relevantz.ticketservice.dto.HistoryResponse;
import com.relevantz.ticketservice.model.TicketHistory;
import com.relevantz.ticketservice.model.TicketStatus;
import com.relevantz.ticketservice.repository.TicketHistoryRepository;

@Service
public class HistoryService {

    private final TicketHistoryRepository repo;

    public HistoryService(TicketHistoryRepository repo) {
        this.repo = repo;
    }

    // ✅ GET history for a ticket
    public List<HistoryResponse> getHistory(Long ticketId) {
        return repo.findByTicketIdOrderByCreatedAtAsc(ticketId)
                   .stream()
                   .map(HistoryResponse::from)
                   .toList();
    }

    // ✅ SAVE history (system or user)
    public void saveHistory(Long ticketId,
                            TicketStatus status,
                            String remarks,
                            Long changedBy) {

        TicketHistory history = new TicketHistory();
        history.setTicketId(ticketId);
        history.setStatus(status);
        history.setRemarks(remarks);
        history.setChangedBy(changedBy); // 0 = System, userId = Agent
        history.setCreatedAt(LocalDateTime.now());

        repo.save(history);
    }
}