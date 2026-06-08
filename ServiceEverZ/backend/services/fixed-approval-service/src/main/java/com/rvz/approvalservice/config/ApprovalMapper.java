package com.rvz.approvalservice.config;

import com.rvz.approvalservice.dto.response.ApprovalResponse;
import com.rvz.approvalservice.entity.TicketApproval;
import org.springframework.stereotype.Component;

@Component
public class ApprovalMapper {
    public ApprovalResponse toResponse(TicketApproval entity) {
        ApprovalResponse dto = new ApprovalResponse();
        dto.setApprovalId(entity.getApprovalId());
        dto.setTicketId(entity.getTicketId());
        dto.setL1ApproverId(entity.getL1ApproverId());
        dto.setL1ApproverEmail(entity.getL1ApproverEmail());
        dto.setL1ApproverName(entity.getL1ApproverName());
        dto.setL1Status(entity.getL1Status());
        dto.setL2ApproverId(entity.getL2ApproverId());
        dto.setL2ApproverEmail(entity.getL2ApproverEmail());
        dto.setL2ApproverName(entity.getL2ApproverName());
        dto.setL2Status(entity.getL2Status());
        dto.setResourceOwnerId(entity.getResourceOwnerId());
        dto.setResourceOwnerEmail(entity.getResourceOwnerEmail());
        dto.setResourceOwnerName(entity.getResourceOwnerName());
        dto.setResourceOwnerStatus(entity.getResourceOwnerStatus());
        dto.setRequiresResourceApproval(entity.getRequiresResourceApproval());
        dto.setOverallStatus(entity.getOverallStatus());
        dto.setRemarks(entity.getRemarks());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setTicketNumber(entity.getTicketNumber());

        dto.setTicketSubject(entity.getTicketSubject());

        dto.setRequesterName(entity.getRequesterName());

        return dto;
    }
}
