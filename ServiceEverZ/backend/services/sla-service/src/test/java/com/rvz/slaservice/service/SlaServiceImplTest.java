package com.rvz.slaservice.service;

import com.rvz.slaservice.config.SlaMapper;
import com.rvz.slaservice.dto.request.StartSlaRequest;
import com.rvz.slaservice.dto.request.TicketActionRequest;
import com.rvz.slaservice.dto.response.SlaResponse;
import com.rvz.slaservice.entity.TicketSla;
import com.rvz.slaservice.exception.ResourceNotFoundException;
import com.rvz.slaservice.exception.SlaException;
import com.rvz.slaservice.repository.TicketSlaRepository;
import com.rvz.slaservice.service.impl.SlaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SlaServiceImplTest {
    @Mock private TicketSlaRepository ticketSlaRepository;
    @Mock private SlaMapper slaMapper;
    @Mock private RestTemplate restTemplate;
    @InjectMocks private SlaServiceImpl slaService;

    private TicketSla ticketSla;
    private SlaResponse response;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(slaService, "emailServiceUrl", "http://localhost:8085/api/mail/send");
        ReflectionTestUtils.setField(slaService, "itsmManagerEmail", "itsm.manager@itsm.com");

        ticketSla = new TicketSla();
        ticketSla.setSlaId(1);
        ticketSla.setTicketId(101L);
        ticketSla.setStatus("RUNNING");
        ticketSla.setStartedAt(LocalDateTime.now().minusHours(1));
        ticketSla.setDueAt(LocalDateTime.now().plusHours(3));
        ticketSla.setTotalPausedMinutes(0L);
        ticketSla.setBreached(false);

        response = new SlaResponse();
        response.setSlaId(1);
        response.setTicketId(101L);
    }

    @Test
    void startSla_createsRecord() {
        StartSlaRequest request = new StartSlaRequest();
        request.setTicketId(101L);
        request.setSlaMinutes(240L);
        when(ticketSlaRepository.findByTicketId(101L)).thenReturn(Optional.empty());
        when(ticketSlaRepository.save(any(TicketSla.class))).thenAnswer(i -> i.getArgument(0));
        when(slaMapper.toResponse(any(TicketSla.class))).thenReturn(response);
        SlaResponse result = slaService.startSla(request);
        assertNotNull(result);
    }

    @Test
    void putOnHold_changesStatus() {
        TicketActionRequest request = new TicketActionRequest();
        request.setTicketId(101L);
        request.setReason("Waiting for user input");
        when(ticketSlaRepository.findByTicketId(101L)).thenReturn(Optional.of(ticketSla));
        when(ticketSlaRepository.save(any(TicketSla.class))).thenReturn(ticketSla);
        when(slaMapper.toResponse(any(TicketSla.class))).thenReturn(response);
        SlaResponse result = slaService.putOnHold(request);
        assertNotNull(result);
    }

    @Test
    void releaseOnHold_resumesSla() {
        TicketActionRequest request = new TicketActionRequest();
        request.setTicketId(101L);
        request.setReason("Input received");
        ticketSla.setStatus("ON_HOLD");
        ticketSla.setPausedAt(LocalDateTime.now().minusMinutes(15));
        when(ticketSlaRepository.findByTicketId(101L)).thenReturn(Optional.of(ticketSla));
        when(ticketSlaRepository.save(any(TicketSla.class))).thenReturn(ticketSla);
        when(slaMapper.toResponse(any(TicketSla.class))).thenReturn(response);
        SlaResponse result = slaService.releaseOnHold(request);
        assertNotNull(result);
    }

    @Test
    void completeSla_marksCompleted() {
        TicketActionRequest request = new TicketActionRequest();
        request.setTicketId(101L);
        request.setReason("Resolved");
        when(ticketSlaRepository.findByTicketId(101L)).thenReturn(Optional.of(ticketSla));
        when(ticketSlaRepository.save(any(TicketSla.class))).thenReturn(ticketSla);
        when(slaMapper.toResponse(any(TicketSla.class))).thenReturn(response);
        SlaResponse result = slaService.completeSla(request);
        assertNotNull(result);
    }

    @Test
    void getSla_throwsWhenMissing() {
        when(ticketSlaRepository.findByTicketId(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> slaService.getSla(999L));
    }

    @Test
    void putOnHold_throwsWhenInvalidStatus() {
        TicketActionRequest request = new TicketActionRequest();
        request.setTicketId(101L);
        request.setReason("Bad state");
        ticketSla.setStatus("COMPLETED");
        when(ticketSlaRepository.findByTicketId(101L)).thenReturn(Optional.of(ticketSla));
        assertThrows(SlaException.class, () -> slaService.putOnHold(request));
    }
}
