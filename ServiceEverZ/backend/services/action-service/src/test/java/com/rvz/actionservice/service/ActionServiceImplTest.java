package com.rvz.actionservice.service;

import com.rvz.actionservice.client.MailClient;
import com.rvz.actionservice.client.MasterDataClient;
import com.rvz.actionservice.client.TicketClient;
import com.rvz.actionservice.config.ActionMapper;
import com.rvz.actionservice.dto.request.AdditionalInputRequest;
import com.rvz.actionservice.dto.request.TicketActionRequest;
import com.rvz.actionservice.dto.response.ActionResponse;
import com.rvz.actionservice.entity.TicketAction;
import com.rvz.actionservice.repository.TicketActionRepository;
import com.rvz.actionservice.service.impl.ActionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActionServiceImplTest {

    // FIX #5: Correct mocks — MailClient, MasterDataClient, TicketClient
    // RestTemplate was wrongly mocked before; it is not used in ActionServiceImpl.
    @Mock private TicketActionRepository ticketActionRepository;
    @Mock private ActionMapper           actionMapper;
    @Mock private MailClient             mailClient;
    @Mock private MasterDataClient       masterDataClient;
    @Mock private TicketClient           ticketClient;

    @InjectMocks private ActionServiceImpl actionService;

    private TicketAction  savedAction;
    private ActionResponse mappedResponse;

    @BeforeEach
    void setUp() {
        // FIX #6 + #2: inject itsmManagerUserId (Long), not the unused itsmManagerEmail string
        ReflectionTestUtils.setField(actionService, "itsmManagerUserId", 2L);

        savedAction = new TicketAction();
        savedAction.setActionId(1L);
        savedAction.setTicketId(101L);
        savedAction.setStatus("OPEN");
        savedAction.setActionType("COMMENT");
        savedAction.setComments("Test comment");
        savedAction.setActionBy("Support User");
        savedAction.setCreatedAt(LocalDateTime.now());

        mappedResponse = new ActionResponse();
        mappedResponse.setActionId(1L);
        mappedResponse.setTicketId(101L);
    }

    // ── markWorking ───────────────────────────────────────────────────────────

    @Test
    void markWorking_savesActionWithWorkingStatus() {
        TicketActionRequest request = buildActionRequest(101L, "Support User", "Started work");
        when(ticketActionRepository.save(any(TicketAction.class))).thenReturn(savedAction);
        when(actionMapper.toResponse(savedAction)).thenReturn(mappedResponse);

        ActionResponse result = actionService.markWorking(request);

        assertNotNull(result);
        verify(ticketActionRepository).save(argThat(a ->
                "WORKING".equals(a.getStatus()) && "COMMENT".equals(a.getActionType())));
        verifyNoInteractions(mailClient); // markWorking sends no emails
    }

    // ── addComment ────────────────────────────────────────────────────────────

    @Test
    void addComment_savesActionWithOpenStatus() {
        TicketActionRequest request = buildActionRequest(101L, "Support User", "Need logs");
        when(ticketActionRepository.save(any(TicketAction.class))).thenReturn(savedAction);
        when(actionMapper.toResponse(savedAction)).thenReturn(mappedResponse);

        ActionResponse result = actionService.addComment(request);

        assertNotNull(result);
        verify(ticketActionRepository).save(argThat(a ->
                "OPEN".equals(a.getStatus()) && "COMMENT".equals(a.getActionType())));
        verifyNoInteractions(mailClient); // addComment sends no emails
    }

    // ── requestAdditionalInput ────────────────────────────────────────────────

    @Test
    void requestAdditionalInput_savesAndSendsEmailToRealRequester() {
        AdditionalInputRequest request = new AdditionalInputRequest();
        request.setTicketId(101L);
        request.setRequestedBy("Support User");
        request.setComment("Please provide screenshot");

        // Ticket lookup returns requestedById = 5
        when(ticketClient.getTicketById(101L))
                .thenReturn(Map.of("data", Map.of("requestedById", 5)));

        // Master-data returns real email for userId=5
        when(masterDataClient.getUserById(5L))
                .thenReturn(Map.of("data", Map.of("email", "john.doe@company.com")));

        when(ticketActionRepository.save(any(TicketAction.class))).thenReturn(savedAction);
        when(actionMapper.toResponse(savedAction)).thenReturn(mappedResponse);

        ActionResponse result = actionService.requestAdditionalInput(request);

        assertNotNull(result);
        verify(ticketActionRepository).save(argThat(a ->
                "ADDITIONAL_INPUT".equals(a.getActionType())));
        // FIX #1 & #5 verified: email goes to real address, not "end.user@itsm.com"
        verify(mailClient).sendEmail(argThat(e ->
                "john.doe@company.com".equals(e.getTo())
                && e.getSubject().contains("101")));
    }

    @Test
    void requestAdditionalInput_doesNotFailWhenTicketLookupFails() {
        AdditionalInputRequest request = new AdditionalInputRequest();
        request.setTicketId(101L);
        request.setRequestedBy("Support User");
        request.setComment("Please provide screenshot");

        when(ticketClient.getTicketById(101L)).thenThrow(new RuntimeException("service down"));
        when(ticketActionRepository.save(any(TicketAction.class))).thenReturn(savedAction);
        when(actionMapper.toResponse(savedAction)).thenReturn(mappedResponse);

        // Should not throw — email failure is non-fatal
        ActionResponse result = actionService.requestAdditionalInput(request);
        assertNotNull(result);
        verifyNoInteractions(mailClient);
    }

    // ── closeTicket ───────────────────────────────────────────────────────────

    @Test
    void closeTicket_savesAndSendsEmailToRequesterAndManager() {
        TicketActionRequest request = buildActionRequest(101L, "Support User", "Resolved successfully");

        // Ticket returns requestedById = 5
        when(ticketClient.getTicketById(101L))
                .thenReturn(Map.of("data", Map.of("requestedById", 5)));

        // userId=5 → requester email
        when(masterDataClient.getUserById(5L))
                .thenReturn(Map.of("data", Map.of("email", "john.doe@company.com")));

        // itsmManagerUserId=2 → manager email
        when(masterDataClient.getUserById(2L))
                .thenReturn(Map.of("data", Map.of("email", "manager@company.com")));

        when(ticketActionRepository.save(any(TicketAction.class))).thenReturn(savedAction);
        when(actionMapper.toResponse(savedAction)).thenReturn(mappedResponse);

        ActionResponse result = actionService.closeTicket(request);

        assertNotNull(result);
        verify(ticketActionRepository).save(argThat(a -> "CLOSED".equals(a.getStatus())));

        // FIX #1 & #5 verified: two real emails sent, not fake placeholders
        verify(mailClient, times(2)).sendEmail(any());
        verify(mailClient).sendEmail(argThat(e ->
                "john.doe@company.com".equals(e.getTo())));
        verify(mailClient).sendEmail(argThat(e ->
                "manager@company.com".equals(e.getTo())));
    }

    @Test
    void closeTicket_doesNotFailWhenEmailResolutionFails() {
        TicketActionRequest request = buildActionRequest(101L, "Support User", "Resolved");

        when(ticketClient.getTicketById(101L)).thenThrow(new RuntimeException("service down"));
        when(masterDataClient.getUserById(2L)).thenThrow(new RuntimeException("service down"));
        when(ticketActionRepository.save(any(TicketAction.class))).thenReturn(savedAction);
        when(actionMapper.toResponse(savedAction)).thenReturn(mappedResponse);

        // Must not throw — email failures are always non-fatal
        ActionResponse result = actionService.closeTicket(request);
        assertNotNull(result);
        verifyNoInteractions(mailClient);
    }

    // ── getTimeline ───────────────────────────────────────────────────────────

    @Test
    void getTimeline_returnsActionsInOrder() {
        when(ticketActionRepository.findByTicketIdOrderByCreatedAtAsc(101L))
                .thenReturn(List.of(savedAction));
        when(actionMapper.toResponse(savedAction)).thenReturn(mappedResponse);

        List<ActionResponse> result = actionService.getTimeline(101L);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(ticketActionRepository).findByTicketIdOrderByCreatedAtAsc(101L);
    }

    @Test
    void getTimeline_returnsEmptyListWhenNoActions() {
        when(ticketActionRepository.findByTicketIdOrderByCreatedAtAsc(999L))
                .thenReturn(List.of());

        List<ActionResponse> result = actionService.getTimeline(999L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    private TicketActionRequest buildActionRequest(Long ticketId, String actionBy, String comments) {
        TicketActionRequest req = new TicketActionRequest();
        req.setTicketId(ticketId);
        req.setActionBy(actionBy);
        req.setComments(comments);
        return req;
    }
}
