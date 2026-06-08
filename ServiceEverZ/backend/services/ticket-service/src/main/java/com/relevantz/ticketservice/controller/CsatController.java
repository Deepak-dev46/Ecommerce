package com.relevantz.ticketservice.controller;

import com.relevantz.ticketservice.dto.CsatDtos.*;
import com.relevantz.ticketservice.service.CsatService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * REST Controller — Sub-module 02: Feedback (CSAT)
 *
 * Public endpoints (no auth required):
 *   GET  /api/csat/survey-form?token=   — decode token & return prefilled data
 *   POST /api/csat/submit               — submit feedback (rating + comments)
 *
 * Internal endpoints (ITSM_MANAGER role required):
 *   GET  /api/csat/dashboard            — full dashboard with filters
 *   POST /api/csat/trigger/{ticketId}   — manually re-trigger survey email
 *
 * The survey trigger is normally called automatically by TicketService
 * when status changes to RESOLVED or CLOSED (see TicketService integration note).
 */
@RestController
@RequestMapping("/api/csat")
public class CsatController {

    private final CsatService csatService;

    public CsatController(CsatService csatService) {
        this.csatService = csatService;
    }

    /**
     * GET /api/csat/survey-form?token={base64token}
     * Called when user clicks the feedback link from the email.
     * Returns pre-mapped ticket information to auto-fill the form.
     * PUBLIC — no authentication required.
     */
    @GetMapping("/survey-form")
    public ResponseEntity<SurveyTokenPayload> getSurveyForm(@RequestParam String token) {
        return ResponseEntity.ok(csatService.decodeSurveyToken(token));
    }

    /**
     * POST /api/csat/submit
     * Submit feedback after user fills the form.
     * Handles anonymous vs non-anonymous logic internally.
     * PUBLIC — no authentication required (user clicks from email link).
     */
    @PostMapping("/submit")
    public ResponseEntity<CsatSurveyResponse> submitFeedback(
            @Valid @RequestBody SubmitFeedbackRequest request) {
        return ResponseEntity.ok(csatService.submitFeedback(request));
    }

    /**
     * GET /api/csat/dashboard
     * ISTM Manager dashboard — all CSAT records with optional filters.
     *
     * Query params (all optional):
     *   agentId   — filter by resolved-by agent
     *   category  — filter by ticket category
     *   from      — ISO date-time start (e.g. 2025-01-01T00:00:00)
     *   to        — ISO date-time end
     *
     * ITSM_MANAGER role required — enforce via API Gateway / Security config.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<CsatDashboardSummary> getDashboard(
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        return ResponseEntity.ok(csatService.getDashboard(agentId, category, from, to));
    }

    /**
     * POST /api/csat/trigger/{ticketId}?requesterEmail=
     * Manually (re-)trigger a survey email — useful for testing or admin use.
     * Duplicate prevention still applies.
     */
    @PostMapping("/trigger/{ticketId}")
    public ResponseEntity<String> triggerSurvey(
            @PathVariable Long ticketId,
            @RequestParam String requesterEmail) {
        csatService.triggerSurveyIfNeeded(ticketId, requesterEmail);
        return ResponseEntity.ok("Survey trigger processed.");
    }
}
