package com.relevantz.ticketservice.dto;



import com.relevantz.ticketservice.model.TicketQueue;

public class QueueResponse {

    private Long approverId;
    private String status;

    public static QueueResponse from(TicketQueue q) {
        QueueResponse r = new QueueResponse();
        r.approverId = q.getApproverId();
        r.status = q.getStatus().name();
        return r;
    }

    public Long getApproverId() { return approverId; }
    public String getStatus() { return status; }
}
