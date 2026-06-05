package com.relevantz.ticketservice.model;

public enum TicketMode {
    EMAIL,        // Ticket created via email
    PORTAL,       // Ticket created via web portal
    PHONE,        // Ticket created via phone call
    CHAT,         // Ticket created via chat system
    API,          // Ticket created via API integration
    MANUAL        // Ticket created manually by staff
}