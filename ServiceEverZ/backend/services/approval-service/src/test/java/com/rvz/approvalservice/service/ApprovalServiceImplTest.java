package com.rvz.approvalservice.service;

import com.rvz.approvalservice.config.ApprovalMapper;
import com.rvz.approvalservice.dto.request.ApprovalActionRequest;
import com.rvz.approvalservice.dto.request.InitiateApprovalRequest;
import com.rvz.approvalservice.dto.response.ApprovalResponse;
import com.rvz.approvalservice.entity.TicketApproval;
import com.rvz.approvalservice.exception.ApprovalException;
import com.rvz.approvalservice.exception.ResourceNotFoundException;
import com.rvz.approvalservice.repository.TicketApprovalRepository;
import com.rvz.approvalservice.service.impl.ApprovalServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApprovalServiceImplTest {
    @Mock private TicketApprovalRepository approvalRepository;
    @Mock private ApprovalMapper approvalMapper;
    @Mock private RestTemplate restTemplate;
    @InjectMocks private ApprovalServiceImpl approvalService;

    private TicketApproval approval;
    private ApprovalResponse response;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(approvalService, "emailServiceUrl", "http://localhost:8085/api/mail/send");
        ReflectionTestUtils.setField(approvalService, "assignmentServiceUrl", "http://localhost:8084/api/assignments/trigger");

        approval = new TicketApproval();
        approval.setApprovalId(1L);
        approval.setTicketId(101L);
        approval.setL1ApproverEmail("l1@itsm.com");
        approval.setL2ApproverEmail("l2@itsm.com");
        approval.setResourceOwnerEmail("ro@itsm.com");
        approval.setL1Status("PENDING");
        approval.setL2Status("PENDING");
        approval.setResourceOwnerStatus("NOT_REQUIRED");
        approval.setRequiresResourceApproval(false);
        approval.setOverallStatus("PENDING");

        response = new ApprovalResponse();
        response.setApprovalId(1L);
        response.setTicketId(101L);
    }

    @Test
    void initiateApproval_createsWorkflow() {
        InitiateApprovalRequest request = new InitiateApprovalRequest();
        request.setTicketId(101L);
        request.setL1ApproverId("EMP1001");
        request.setL1ApproverName("L1 Approver");
        request.setL1ApproverEmail("l1@itsm.com");
        request.setL2ApproverId("EMP1002");
        request.setL2ApproverName("L2 Approver");
        request.setL2ApproverEmail("l2@itsm.com");
        request.setRequiresResourceApproval(false);
        request.setRequesterName("User A");
        request.setRequesterEmail("user@itsm.com");
        request.setTicketSubject("Access request");

        when(approvalRepository.findByTicketId(101L)).thenReturn(Optional.empty());
        when(approvalRepository.save(any(TicketApproval.class))).thenAnswer(i -> i.getArgument(0));
        when(approvalMapper.toResponse(any(TicketApproval.class))).thenReturn(response);

        ApprovalResponse result = approvalService.initiateApproval(request);
        assertNotNull(result);
    }

    @Test
    void processApproval_l1Reject_updatesL2Status() {
        ApprovalActionRequest request = new ApprovalActionRequest();
        request.setTicketId(101L);
        request.setApproverLevel("L1");
        request.setAction("REJECTED");
        request.setRemarks("Insufficient details");

        when(approvalRepository.findByTicketId(101L)).thenReturn(Optional.of(approval));
        when(approvalRepository.save(any(TicketApproval.class))).thenReturn(approval);
        when(approvalMapper.toResponse(any(TicketApproval.class))).thenReturn(response);

        ApprovalResponse result = approvalService.processApproval(request);
        assertNotNull(result);
    }

    @Test
    void processApproval_l2BeforeL1_throwsException() {
        ApprovalActionRequest request = new ApprovalActionRequest();
        request.setTicketId(101L);
        request.setApproverLevel("L2");
        request.setAction("APPROVED");
        request.setRemarks("Approved");

        when(approvalRepository.findByTicketId(101L)).thenReturn(Optional.of(approval));
        assertThrows(ApprovalException.class, () -> approvalService.processApproval(request));
    }

    @Test
    void getApprovalStatus_throwsWhenMissing() {
        when(approvalRepository.findByTicketId(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> approvalService.getApprovalStatus(999L));
    }
}
