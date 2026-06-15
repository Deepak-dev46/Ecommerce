package com.rvz.slaservice.service.impl;

import com.rvz.slaservice.client.MailClient;
import com.rvz.slaservice.config.SlaConstants;
import com.rvz.slaservice.config.SlaMapper;
import com.rvz.slaservice.dto.request.EmailRequest;
import com.rvz.slaservice.dto.request.StartSlaRequest;
import com.rvz.slaservice.dto.request.TicketActionRequest;
import com.rvz.slaservice.dto.response.SlaResponse;
import com.rvz.slaservice.entity.TicketSla;
import com.rvz.slaservice.exception.ResourceNotFoundException;
import com.rvz.slaservice.exception.SlaException;
import com.rvz.slaservice.repository.TicketSlaRepository;
import com.rvz.slaservice.service.SlaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Transactional
public class SlaServiceImpl implements SlaService {
    private static final Logger log = LoggerFactory.getLogger(SlaServiceImpl.class);

    private final TicketSlaRepository ticketSlaRepository;
    private final SlaMapper slaMapper;
    private final MailClient mailClient;

    @Value("${itsm.manager.email}")
    private String itsmManagerEmail;

    public SlaServiceImpl(TicketSlaRepository ticketSlaRepository,
                          SlaMapper slaMapper,
                          MailClient mailClient) {
        this.ticketSlaRepository = ticketSlaRepository;
        this.slaMapper = slaMapper;
        this.mailClient = mailClient;
    }

    @Override
    public SlaResponse startSla(StartSlaRequest request) {
        TicketSla sla = ticketSlaRepository.findByTicketId(request.getTicketId()).orElse(new TicketSla());
        LocalDateTime now = LocalDateTime.now();
        sla.setTicketId(request.getTicketId());
        sla.setStatus(SlaConstants.STATUS_RUNNING);
        sla.setStartedAt(now);
        sla.setDueAt(now.plusMinutes(request.getSlaMinutes()));
        sla.setTotalPausedMinutes(0L);
        sla.setBreached(false);
        TicketSla saved = ticketSlaRepository.save(sla);
        return slaMapper.toResponse(saved);
    }

    @Override
    public SlaResponse putOnHold(TicketActionRequest request) {
        TicketSla sla = getExisting(request.getTicketId());
        if (!SlaConstants.STATUS_RUNNING.equals(sla.getStatus())) {
            throw new SlaException("Only RUNNING SLA can be put on hold");
        }
        sla.setStatus(SlaConstants.STATUS_ON_HOLD);
        sla.setPausedAt(LocalDateTime.now());
        TicketSla saved = ticketSlaRepository.save(sla);
        sendEmailSafe("end.user@itsm.com", "Ticket On Hold - #" + request.getTicketId(), "Your ticket is on hold. Reason: " + request.getReason());
        sendEmailSafe(itsmManagerEmail, "Ticket On Hold - #" + request.getTicketId(), "Ticket is on hold. Reason: " + request.getReason());
        return slaMapper.toResponse(saved);
    }

    @Override
    public SlaResponse releaseOnHold(TicketActionRequest request) {
        TicketSla sla = getExisting(request.getTicketId());
        if (!SlaConstants.STATUS_ON_HOLD.equals(sla.getStatus())) {
            throw new SlaException("Only ON_HOLD SLA can be released");
        }
        LocalDateTime now = LocalDateTime.now();
        long pausedMinutes = Duration.between(sla.getPausedAt(), now).toMinutes();
        sla.setTotalPausedMinutes(sla.getTotalPausedMinutes() + pausedMinutes);
        sla.setDueAt(sla.getDueAt().plusMinutes(pausedMinutes));
        sla.setResumedAt(now);
        sla.setPausedAt(null);
        sla.setStatus(SlaConstants.STATUS_RUNNING);
        TicketSla saved = ticketSlaRepository.save(sla);
        return slaMapper.toResponse(saved);
    }

    @Override
    public SlaResponse completeSla(TicketActionRequest request) {
        TicketSla sla = getExisting(request.getTicketId());
        sla.setCompletedAt(LocalDateTime.now());
        sla.setStatus(SlaConstants.STATUS_COMPLETED);
        if (sla.getCompletedAt().isAfter(sla.getDueAt())) {
            sla.setBreached(true);
            sla.setStatus(SlaConstants.STATUS_BREACHED);
        }
        TicketSla saved = ticketSlaRepository.save(sla);
        sendEmailSafe("end.user@itsm.com", "Ticket Closed - #" + request.getTicketId(), "Your ticket has been closed.");
        sendEmailSafe("support.person@itsm.com", "Ticket Closed - #" + request.getTicketId(), "The ticket has been closed successfully.");
        return slaMapper.toResponse(saved);
    }

    @Override
    public SlaResponse checkBreach(Long ticketId) {
        TicketSla sla = getExisting(ticketId);
        if (SlaConstants.STATUS_RUNNING.equals(sla.getStatus()) && LocalDateTime.now().isAfter(sla.getDueAt())) {
            sla.setBreached(true);
            sla.setStatus(SlaConstants.STATUS_BREACHED);
            ticketSlaRepository.save(sla);
        }
        return slaMapper.toResponse(sla);
    }

    @Override
    @Transactional(readOnly = true)
    public SlaResponse getSla(Long ticketId) {
        return slaMapper.toResponse(getExisting(ticketId));
    }

    private TicketSla getExisting(Long ticketId) {
        return ticketSlaRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(SlaConstants.SLA_NOT_FOUND + ticketId));
    }

    private void sendEmailSafe(String to, String subject, String body) {
        try {
            mailClient.sendEmail(new EmailRequest(to, subject, body, false));
            log.info("Email sent to {}", to);
        } catch (Exception ex) {
            log.warn("Email service call failed: {}", ex.getMessage());
        }
    }
}
