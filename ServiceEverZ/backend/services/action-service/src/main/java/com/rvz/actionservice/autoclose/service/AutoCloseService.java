package com.rvz.actionservice.autoclose.service;

import com.rvz.actionservice.autoclose.dto.AutoCloseConfigRequest;
import com.rvz.actionservice.autoclose.dto.AutoCloseConfigResponse;
import com.rvz.actionservice.autoclose.dto.TicketAutoCloseStateResponse;
import java.util.List;

public interface AutoCloseService {

    // ── Configuration (ITSM Manager) ──────────────────────────────────────────

    /** Create or update a config. slaId=null → global; slaId=X → SLA-specific. */
    AutoCloseConfigResponse upsertConfig(AutoCloseConfigRequest request, Long managerId);

    /** All configs (global + all SLA-specific). */
    List<AutoCloseConfigResponse> getAllConfigs();

    /** Effective config for a ticket: SLA-specific if exists, else global. */
    AutoCloseConfigResponse getEffectiveConfig(Long slaId);

    /** Delete a config by its primary key. */
    void deleteConfig(Long configId);

    // ── Ticket lifecycle hooks (called by ActionServiceImpl) ──────────────────

    /**
     * Called when a ticket status changes to RESOLVED.
     * Starts (or restarts) the auto-close countdown.
     *
     * @param ticketId the resolved ticket
     * @param slaId    SLA policy of the ticket (may be null)
     */
    void onTicketResolved(Long ticketId, Long slaId);

    /**
     * Called when a ticket status changes to REOPENED.
     * Immediately stops the auto-close countdown.
     *
     * @param ticketId the reopened ticket
     */
    void onTicketReopened(Long ticketId);

    // ── State query ───────────────────────────────────────────────────────────

    TicketAutoCloseStateResponse getStateForTicket(Long ticketId);
}
