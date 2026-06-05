package com.relevantz.ticketservice.dto;

import java.time.LocalDateTime;
import com.relevantz.ticketservice.model.TicketItemTimePeriod;

public class TimePeriodResponse {

    private LocalDateTime softwareAccessRequiredTill;

    public static TimePeriodResponse from(TicketItemTimePeriod t) {
        TimePeriodResponse r = new TimePeriodResponse();
        r.softwareAccessRequiredTill = t.getSoftwareAccessRequiredTill();
        return r;
    }

    public LocalDateTime getSoftwareAccessRequiredTill() {
        return softwareAccessRequiredTill;
    }
}