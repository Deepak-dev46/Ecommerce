package com.relevantz.ticketservice.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.relevantz.ticketservice.model.SlaStatus;
import com.relevantz.ticketservice.model.TicketSlaTracking;
import com.relevantz.ticketservice.repository.TicketSlaTrackingRepository;

@Service
@Transactional
public class SlaService {

    private final TicketSlaTrackingRepository repo;

    public SlaService(TicketSlaTrackingRepository repo) {
        this.repo = repo;
    }

    // ✅ START SLA
    public void startSla(Long ticketId) {
        TicketSlaTracking sla = new TicketSlaTracking();
        sla.setTicketId(ticketId);
        sla.setSlaStartTime(LocalDateTime.now());
        sla.setSlaStatus(SlaStatus.RUNNING);
        repo.save(sla);
    }

    // ✅ PAUSE SLA
    public void pauseSla(Long ticketId) {
        TicketSlaTracking sla = get(ticketId);
        if (sla.getSlaStatus() == SlaStatus.RUNNING) {
            sla.setSlaPausedAt(LocalDateTime.now());
            sla.setSlaStatus(SlaStatus.PAUSED);
        }
    }

    // ✅ RESUME SLA (BUG FIX)
    public void resumeSla(Long ticketId) {
        TicketSlaTracking sla = get(ticketId);
        if (sla.getSlaStatus() == SlaStatus.PAUSED) {
            long pausedMinutes = Duration
                    .between(sla.getSlaPausedAt(), LocalDateTime.now())
                    .toMinutes();

            sla.setTotalPausedMinutes(
                sla.getTotalPausedMinutes() + pausedMinutes
            );

            sla.setSlaPausedAt(null);
            sla.setSlaStatus(SlaStatus.RUNNING);
        }
    }

    // ✅ EFFECTIVE SLA TIME
    public long getEffectiveElapsedMinutes(Long ticketId) {
        TicketSlaTracking sla = get(ticketId);
        long total = Duration
                .between(sla.getSlaStartTime(), LocalDateTime.now())
                .toMinutes();
        return total - sla.getTotalPausedMinutes();
    }

    // ✅ COMPLETE SLA
    public void completeSla(Long ticketId) {
        TicketSlaTracking sla = get(ticketId);
        sla.setSlaStatus(SlaStatus.COMPLETED);
    }

    private TicketSlaTracking get(Long ticketId) {
        return repo.findByTicketId(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("SLA not found for ticket: " + ticketId));
    }
}