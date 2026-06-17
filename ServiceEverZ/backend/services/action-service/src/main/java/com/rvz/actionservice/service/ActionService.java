package com.rvz.actionservice.service;

import com.rvz.actionservice.dto.request.AdditionalInputRequest;
import com.rvz.actionservice.dto.request.TicketActionRequest;
import com.rvz.actionservice.dto.response.ActionResponse;

import java.util.List;

public interface ActionService {
    ActionResponse markWorking(TicketActionRequest request);
    ActionResponse addComment(TicketActionRequest request);
    ActionResponse requestAdditionalInput(AdditionalInputRequest request);
    ActionResponse closeTicket(TicketActionRequest request);
    List<ActionResponse> getTimeline(Long ticketId);


    // ── NEW: added for auto-close feature ────────────────────────────────────
    /** Mark ticket as RESOLVED and start the auto-close countdown. */
    ActionResponse resolveTicket(TicketActionRequest request);

    /** Reopen a RESOLVED ticket and stop the auto-close countdown immediately. */
    ActionResponse reopenTicket(TicketActionRequest request);


}
