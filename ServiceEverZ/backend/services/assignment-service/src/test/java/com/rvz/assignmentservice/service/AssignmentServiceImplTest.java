package com.rvz.assignmentservice.service;

import com.rvz.assignmentservice.config.AssignmentMapper;
import com.rvz.assignmentservice.dto.request.AcknowledgeRequest;
import com.rvz.assignmentservice.dto.request.TriggerAssignmentRequest;
import com.rvz.assignmentservice.dto.response.AssignmentResponse;
import com.rvz.assignmentservice.entity.SupportPersonnelCapacity;
import com.rvz.assignmentservice.entity.TicketAssignment;
import com.rvz.assignmentservice.exception.AssignmentException;
import com.rvz.assignmentservice.exception.ResourceNotFoundException;
import com.rvz.assignmentservice.repository.SupportPersonnelCapacityRepository;
import com.rvz.assignmentservice.repository.TicketAssignmentRepository;
import com.rvz.assignmentservice.service.impl.AssignmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceImplTest {
    @Mock private TicketAssignmentRepository ticketAssignmentRepository;
    @Mock private SupportPersonnelCapacityRepository capacityRepository;
    @Mock private AssignmentMapper assignmentMapper;
    @Mock private RestTemplate restTemplate;
    @InjectMocks private AssignmentServiceImpl assignmentService;

    private SupportPersonnelCapacity p1;
    private SupportPersonnelCapacity p2;
    private TicketAssignment assignment;
    private AssignmentResponse response;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(assignmentService, "emailServiceUrl", "http://localhost:8085/api/mail/send");
        ReflectionTestUtils.setField(assignmentService, "itsmManagerEmail", "itsm.manager@itsm.com");
        ReflectionTestUtils.setField(assignmentService, "ackTimeoutMinutes", 30L);

        p1 = new SupportPersonnelCapacity();
        p1.setSupportPersonId(1L);
        p1.setSupportPersonName("Alice Kumar");
        p1.setActive(true);
        p1.setTotalResponseTimeHours(2.0);

        p2 = new SupportPersonnelCapacity();
        p2.setSupportPersonId(2L);
        p2.setSupportPersonName("Bob Raj");
        p2.setActive(true);
        p2.setTotalResponseTimeHours(5.0);

        assignment = new TicketAssignment();
        assignment.setAssignmentId(1L);
        assignment.setTicketId(101L);
        assignment.setSupportPersonId(1L);
        assignment.setSupportPersonName("Alice Kumar");
        assignment.setStatus("ASSIGNED");
        assignment.setAssignedAt(LocalDateTime.now().minusMinutes(40));
        assignment.setReassigned(false);

        response = new AssignmentResponse();
        response.setAssignmentId(1L);
        response.setTicketId(101L);
    }

    @Test
    void triggerAssignment_assignsHighestRemainingTime() {
        TriggerAssignmentRequest request = new TriggerAssignmentRequest();
        request.setTicketId(101L);
        request.setPriority("HIGH");
        request.setEstimatedHours(2.0);
        request.setResponseTimeHours(1.0);

        when(capacityRepository.findByActiveTrue()).thenReturn(List.of(p1, p2));
        when(ticketAssignmentRepository.findByTicketId(101L)).thenReturn(Optional.empty());
        when(ticketAssignmentRepository.save(any(TicketAssignment.class))).thenAnswer(i -> i.getArgument(0));
        when(assignmentMapper.toResponse(any(TicketAssignment.class))).thenReturn(response);

        AssignmentResponse result = assignmentService.triggerAssignment(request);
        assertNotNull(result);
        verify(ticketAssignmentRepository).save(any(TicketAssignment.class));
    }

    @Test
    void triggerAssignment_throwsWhenNoPersonnel() {
        TriggerAssignmentRequest request = new TriggerAssignmentRequest();
        request.setTicketId(101L);
        request.setPriority("HIGH");
        request.setEstimatedHours(2.0);
        when(capacityRepository.findByActiveTrue()).thenReturn(List.of());
        assertThrows(AssignmentException.class, () -> assignmentService.triggerAssignment(request));
    }

    @Test
    void acknowledgeTicket_updatesToOpen() {
        AcknowledgeRequest request = new AcknowledgeRequest();
        request.setTicketId(101L);
        request.setSupportPersonId(1L);

        when(ticketAssignmentRepository.findByTicketId(101L)).thenReturn(Optional.of(assignment));
        when(ticketAssignmentRepository.save(any(TicketAssignment.class))).thenReturn(assignment);
        when(assignmentMapper.toResponse(any(TicketAssignment.class))).thenReturn(response);

        AssignmentResponse result = assignmentService.acknowledgeTicket(request);
        assertNotNull(result);
        verify(ticketAssignmentRepository).save(any(TicketAssignment.class));
    }

    @Test
    void acknowledgeTicket_throwsForWrongPerson() {
        AcknowledgeRequest request = new AcknowledgeRequest();
        request.setTicketId(101L);
        request.setSupportPersonId(99L);
        when(ticketAssignmentRepository.findByTicketId(101L)).thenReturn(Optional.of(assignment));
        assertThrows(AssignmentException.class, () -> assignmentService.acknowledgeTicket(request));
    }

    @Test
    void checkAndReassignIfTimeout_reassignsToAnotherPerson() {
        when(ticketAssignmentRepository.findByTicketId(101L)).thenReturn(Optional.of(assignment));
        when(capacityRepository.findByActiveTrue()).thenReturn(List.of(p1, p2));
        when(ticketAssignmentRepository.save(any(TicketAssignment.class))).thenAnswer(i -> i.getArgument(0));
        when(assignmentMapper.toResponse(any(TicketAssignment.class))).thenReturn(response);

        AssignmentResponse result = assignmentService.checkAndReassignIfTimeout(101L);
        assertNotNull(result);
        verify(ticketAssignmentRepository).save(any(TicketAssignment.class));
    }

    @Test
    void getAssignment_returnsAssignment() {
        when(ticketAssignmentRepository.findByTicketId(101L)).thenReturn(Optional.of(assignment));
        when(assignmentMapper.toResponse(assignment)).thenReturn(response);
        AssignmentResponse result = assignmentService.getAssignment(101L);
        assertNotNull(result);
    }

    @Test
    void getAssignment_throwsWhenNotFound() {
        when(ticketAssignmentRepository.findByTicketId(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> assignmentService.getAssignment(999L));
    }
}
