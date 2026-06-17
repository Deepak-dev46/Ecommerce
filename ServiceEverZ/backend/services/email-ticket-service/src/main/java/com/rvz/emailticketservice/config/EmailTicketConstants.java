package com.rvz.emailticketservice.config;

/**
 * Shared constants for the email-ticket-service.
 */
public final class EmailTicketConstants {

    private EmailTicketConstants() {}

    public static final String MODE_EMAIL              = "Email";
    public static final String SUBJECT_DELIMITER       = "\\|";
    public static final String SUBJECT_DELIMITER_PLAIN = "|";
    public static final int    SUBJECT_PART_CATEGORY   = 0;
    public static final int    SUBJECT_PART_SUBCATEGORY = 1;
    public static final int    SUBJECT_PART_REQUESTER   = 2;
    public static final int    SUBJECT_REQUIRED_PARTS   = 3;

    public static final long   MAX_ATTACHMENT_BYTES    = 30L * 1024 * 1024; // 30 MB
    public static final String FALLBACK_PRIORITY       = "MEDIUM";
    public static final String FALLBACK_LOCATION       = "Not Specified";

    // ── Acknowledgement (ticket created successfully) ──────────────────────
    public static final String ACK_SUBJECT_PREFIX = "Ticket Created – ";
    public static final String ACK_BODY_TEMPLATE  =
            "Dear %s,\n\n"
            + "Your support request has been received and a ticket has been created.\n\n"
            + "Ticket Number  : %s\n"
            + "Subject        : %s\n"
            + "Category       : %s\n"
            + "Sub-Category   : %s\n"
            + "Item           : %s\n"
            + "Priority       : %s\n"
            + "Project        : %s\n"
            + "Location       : %s\n\n"
            + "Our support team will review your request and get back to you shortly.\n\n"
            + "Thank you,\nServiceEverZ Support Team";

    // ── Missing required fields notification ──────────────────────────────
    public static final String MISSING_FIELDS_SUBJECT  = "Ticket Submission Failed – Missing Required Fields";
    public static final String MISSING_FIELDS_TEMPLATE =
            "Dear %s,\n\n"
            + "We were unable to create your support ticket because the following required field(s) are missing "
            + "or empty:\n\n"
            + "%s\n"
            + "Please resend your email using the correct format:\n\n"
            + "  Subject : Category|SubCategory|Your Full Name\n\n"
            + "  Body (one field per line):\n"
            + "    EmployeeId         : <your employee ID, e.g. 1001>\n"
            + "    Project            : <project name>\n"
            + "    Item               : <service item name>\n"
            + "    Priority           : HIGH / MEDIUM / LOW\n"
            + "    Location           : <your location>\n"
            + "    MobileNumber       : <10-digit mobile number>\n"
            + "    Description        : <describe your issue>\n"
            + "    Asset              : <asset name, if applicable>\n"
            + "    AccessRequiredTill : <YYYY-MM-DD, if applicable>\n\n"
            + "If you need assistance, please contact the helpdesk directly.\n\n"
            + "Thank you,\nServiceEverZ Support Team";

    // ── Master-data validation mismatch notification ───────────────────────
    public static final String MISMATCH_SUBJECT  = "Ticket Submission Failed – Data Validation Error";
    public static final String MISMATCH_TEMPLATE =
            "Dear %s,\n\n"
            + "We were unable to create your support ticket. The following validation error(s) were found "
            + "when checking your details against our records:\n\n"
            + "%s\n"
            + "Please verify your details and resend your email.\n\n"
            + "If you believe this is an error, please contact the IT helpdesk for assistance.\n\n"
            + "Thank you,\nServiceEverZ Support Team";

    // ── Unregistered sender notification ──────────────────────────────────
    public static final String USER_NOT_FOUND_SUBJECT  = "Ticket Submission Failed – Unregistered Email Address";
    public static final String USER_NOT_FOUND_TEMPLATE =
            "Hello,\n\n"
            + "We received a ticket request from this email address (%s), but it is not registered "
            + "in our system.\n\n"
            + "If you are an employee, please contact the IT helpdesk to have your account set up.\n\n"
            + "Thank you,\nServiceEverZ Support Team";
}
