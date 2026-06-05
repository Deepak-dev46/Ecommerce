package com.rvz.actionservice.config;

public final class ActionConstants {
    private ActionConstants() {}
    public static final String STATUS_OPEN             = "OPEN";
    public static final String STATUS_WORKING          = "WORKING";
    public static final String STATUS_ON_HOLD          = "ON_HOLD";
    public static final String STATUS_CLOSED           = "CLOSED";
    public static final String TYPE_COMMENT            = "COMMENT";
    public static final String TYPE_ADDITIONAL_INPUT   = "ADDITIONAL_INPUT";
    public static final String ACTION_NOT_FOUND        = "Ticket action not found for ticketId: ";


    // ── NEW: added for auto-close feature ────────────────────────────────────
    public static final String STATUS_RESOLVED = "RESOLVED";
    public static final String STATUS_REOPENED = "REOPENED";

    public static final String TYPE_RESOLVE = "RESOLVE";
    public static final String TYPE_REOPEN  = "REOPEN";
    public static final String TYPE_CLOSE   = "CLOSE";
}
