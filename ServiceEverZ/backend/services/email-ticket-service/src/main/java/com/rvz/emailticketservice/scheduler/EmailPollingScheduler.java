package com.rvz.emailticketservice.scheduler;

import com.rvz.emailticketservice.service.impl.EmailTicketServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Polls the Gmail IMAP inbox every 60 seconds for new ticket emails. */
@Component
public class EmailPollingScheduler {

    private static final Logger log = LoggerFactory.getLogger(EmailPollingScheduler.class);
    private final EmailTicketServiceImpl service;

    public EmailPollingScheduler(EmailTicketServiceImpl service) {
        this.service = service;
    }

    @Scheduled(fixedDelayString = "${email.imap.poll-interval-ms:60000}",
               initialDelay = 5000)
    public void poll() {
        log.info("IMAP poll started");
        try {
            service.pollInbox();
        } catch (Exception ex) {
            log.error("Scheduler poll error: {}", ex.getMessage(), ex);
        }
        log.info("IMAP poll complete");
    }
}