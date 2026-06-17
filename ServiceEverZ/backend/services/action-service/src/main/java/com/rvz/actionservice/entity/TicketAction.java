package com.rvz.actionservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_actions")
public class TicketAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "action_id")
    private Long actionId;

    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "status")
    private String status;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "action_by")
    private String actionBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public TicketAction() {}

    public Long          getActionId()                         { return actionId; }
    public void          setActionId(Long actionId)            { this.actionId = actionId; }

    public Long          getTicketId()                         { return ticketId; }
    public void          setTicketId(Long ticketId)            { this.ticketId = ticketId; }

    public String        getActionType()                       { return actionType; }
    public void          setActionType(String actionType)      { this.actionType = actionType; }

    public String        getStatus()                           { return status; }
    public void          setStatus(String status)              { this.status = status; }

    public String        getComments()                         { return comments; }
    public void          setComments(String comments)          { this.comments = comments; }

    public String        getActionBy()                         { return actionBy; }
    public void          setActionBy(String actionBy)          { this.actionBy = actionBy; }

    public LocalDateTime getCreatedAt()                        { return createdAt; }
    public void          setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
