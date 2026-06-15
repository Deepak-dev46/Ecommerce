package com.rvz.slaservice.service;

import com.rvz.slaservice.dto.request.StartSlaRequest;
import com.rvz.slaservice.dto.request.TicketActionRequest;
import com.rvz.slaservice.dto.response.SlaResponse;

public interface SlaService {
    SlaResponse startSla(StartSlaRequest request);
    SlaResponse putOnHold(TicketActionRequest request);
    SlaResponse releaseOnHold(TicketActionRequest request);
    SlaResponse completeSla(TicketActionRequest request);
    SlaResponse checkBreach(Long ticketId);
    SlaResponse getSla(Long ticketId);
}
