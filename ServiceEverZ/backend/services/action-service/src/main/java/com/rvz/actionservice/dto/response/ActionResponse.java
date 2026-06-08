package com.rvz.actionservice.dto.response;

import java.time.LocalDateTime;

public class ActionResponse {

    private Long          actionId;
    private Long          ticketId;
    private String        actionType;
    private String        status;
    private String        comments;
    private String        actionBy;
    private LocalDateTime createdAt;

    public ActionResponse() {}

    public Long          getActionId()                        { return actionId; }
    public void          setActionId(Long actionId)           { this.actionId = actionId; }

    public Long          getTicketId()                        { return ticketId; }
    public void          setTicketId(Long ticketId)           { this.ticketId = ticketId; }

    public String        getActionType()                      { return actionType; }
    public void          setActionType(String actionType)     { this.actionType = actionType; }

    public String        getStatus()                          { return status; }
    public void          setStatus(String status)             { this.status = status; }

    public String        getComments()                        { return comments; }
    public void          setComments(String comments)         { this.comments = comments; }

    public String        getActionBy()                        { return actionBy; }
    public void          setActionBy(String actionBy)         { this.actionBy = actionBy; }

    public LocalDateTime getCreatedAt()                       { return createdAt; }
    public void          setCreatedAt(LocalDateTime createdAt){ this.createdAt = createdAt; }
}
