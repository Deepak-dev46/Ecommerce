package com.relevantz.ticketservice.dto;

import com.relevantz.ticketservice.model.CsatSurvey;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for Sub-module 02 — Feedback (CSAT)
 */
public class CsatDtos {

    // ── Submit Feedback Request ───────────────────────────────────────────────

    public static class SubmitFeedbackRequest {

        /** Pre-filled from the survey link token; present when not anonymous */
        private Long ticketId;
        private String ticketNumber;
        private String requesterName;
        private Long requesterUserId;
        private Long resolvedById;
        private String resolvedByName;
        private String categoryName;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        private Integer rating;

        private String comments;

        /** If true: ticketId, requesterName, requesterUserId are NOT stored */
        @NotNull
        private Boolean anonymous = false;

        // getters / setters
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
    }

    // ── Survey Response (for dashboard) ──────────────────────────────────────

    public static class CsatSurveyResponse {
        private Long surveyId;
        private Long ticketId;
        private String ticketNumber;
        private String requesterName;
        private Long resolvedById;
        private String resolvedByName;
        private String categoryName;
        private Integer rating;
        private String comments;
        private Boolean anonymous;
        private LocalDateTime submittedAt;

        public static CsatSurveyResponse from(CsatSurvey s) {
            CsatSurveyResponse r = new CsatSurveyResponse();
            r.surveyId     = s.getSurveyId();
            r.ticketId     = s.getTicketId();
            r.ticketNumber = s.getTicketNumber();
            r.requesterName = s.getRequesterName();
            r.resolvedById  = s.getResolvedById();
            r.resolvedByName = s.getResolvedByName();
            r.categoryName  = s.getCategoryName();
            r.rating        = s.getRating();
            r.comments      = s.getComments();
            r.anonymous     = s.getAnonymous();
            r.submittedAt   = s.getSubmittedAt();
            return r;
        }

        public Long getSurveyId() { return surveyId; }
        public Long getTicketId() { return ticketId; }
        public String getTicketNumber() { return ticketNumber; }
        public String getRequesterName() { return requesterName; }
        public Long getResolvedById() { return resolvedById; }
        public String getResolvedByName() { return resolvedByName; }
        public String getCategoryName() { return categoryName; }
        public Integer getRating() { return rating; }
        public String getComments() { return comments; }
        public Boolean getAnonymous() { return anonymous; }
        public LocalDateTime getSubmittedAt() { return submittedAt; }
    }

    // ── Dashboard Summary ─────────────────────────────────────────────────────

    public static class CsatDashboardSummary {
        private Double overallScore;
        private Long totalResponses;
        private List<CsatSurveyResponse> records;

        public CsatDashboardSummary(Double overallScore, Long totalResponses,
                                    List<CsatSurveyResponse> records) {
            this.overallScore   = overallScore;
            this.totalResponses = totalResponses;
            this.records        = records;
        }

        public Double getOverallScore() { return overallScore; }
        public Long getTotalResponses() { return totalResponses; }
        public List<CsatSurveyResponse> getRecords() { return records; }
    }

    // ── Survey Token Payload (decoded from feedback link) ─────────────────────

    public static class SurveyTokenPayload {
        private Long ticketId;
        private String ticketNumber;
        private String requesterName;
        private Long requesterUserId;
        private Long resolvedById;
        private String resolvedByName;
        private String categoryName;
        private String requesterEmail;

        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
        public String getTicketNumber() { return ticketNumber; }
        public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
        public String getRequesterName() { return requesterName; }
        public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
        public Long getRequesterUserId() { return requesterUserId; }
        public void setRequesterUserId(Long v) { this.requesterUserId = v; }
        public Long getResolvedById() { return resolvedById; }
        public void setResolvedById(Long v) { this.resolvedById = v; }
        public String getResolvedByName() { return resolvedByName; }
        public void setResolvedByName(String v) { this.resolvedByName = v; }
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String v) { this.categoryName = v; }
        public String getRequesterEmail() { return requesterEmail; }
        public void setRequesterEmail(String v) { this.requesterEmail = v; }
    }
}
