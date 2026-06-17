package com.relevantz.ticketservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores CSAT feedback submitted by users after ticket resolution.
 * Anonymous records must NOT contain ticketId / requesterName / requesterUserId.
 */
@Entity
@Table(name = "csat_survey",
       uniqueConstraints = @UniqueConstraint(columnNames = "ticket_id"))   // prevent duplicates
public class CsatSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long surveyId;

    /** Null when anonymous = true (PII protection) */
    @Column(name = "ticket_id")
    private Long ticketId;

    /** Null when anonymous = true */
    @Column(name = "ticket_number")
    private String ticketNumber;

    /** Null when anonymous = true */
    @Column(name = "requester_name")
    private String requesterName;

    /** Null when anonymous = true */
    @Column(name = "requester_user_id")
    private Long requesterUserId;

    /** Always stored — needed for agent-wise report */
    @Column(name = "resolved_by_id")
    private Long resolvedById;

    @Column(name = "resolved_by_name")
    private String resolvedByName;

    /** Always stored — needed for category-wise report */
    @Column(name = "category_name")
    private String categoryName;

    /** 1–5 CSAT score */
    @Column(name = "rating")
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "is_anonymous", nullable = false)
    private Boolean anonymous = false;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    /** Tracks whether a survey email has already been sent for duplicate prevention */
    @Column(name = "survey_sent", nullable = false)
    private Boolean surveySent = false;

    @PrePersist
    public void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }

    // ── Getters / Setters ──────────────────────────────────────────────────────

    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public Long getRequesterUserId() { return requesterUserId; }
    public void setRequesterUserId(Long requesterUserId) { this.requesterUserId = requesterUserId; }

    public Long getResolvedById() { return resolvedById; }
    public void setResolvedById(Long resolvedById) { this.resolvedById = resolvedById; }

    public String getResolvedByName() { return resolvedByName; }
    public void setResolvedByName(String resolvedByName) { this.resolvedByName = resolvedByName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Boolean getAnonymous() { return anonymous; }
    public void setAnonymous(Boolean anonymous) { this.anonymous = anonymous; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public Boolean getSurveySent() { return surveySent; }
    public void setSurveySent(Boolean surveySent) { this.surveySent = surveySent; }
}
