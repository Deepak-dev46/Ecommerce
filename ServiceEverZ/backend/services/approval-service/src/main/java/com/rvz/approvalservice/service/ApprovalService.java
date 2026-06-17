// package com.rvz.approvalservice.service;

// import com.rvz.approvalservice.dto.request.ApprovalActionRequest;
// import com.rvz.approvalservice.dto.request.InitiateApprovalRequest;
// import com.rvz.approvalservice.dto.response.ApprovalResponse;
// import java.util.List;

// public interface ApprovalService {
//     ApprovalResponse initiateApproval(InitiateApprovalRequest request);
//     ApprovalResponse processApproval(ApprovalActionRequest request);
//     ApprovalResponse getApprovalStatus(Long ticketId);

//     // FIX 2: project-scoped — pass approverId to filter by that user only
//     List<ApprovalResponse> getPendingL1Approvals(String approverId);
//     List<ApprovalResponse> getPendingL2Approvals(String approverId);
//     List<ApprovalResponse> getPendingResourceOwnerApprovals(String approverId);

//     // FIX 3: history endpoints
//     List<ApprovalResponse> getL1History(String approverId);
//     List<ApprovalResponse> getL2History(String approverId);
// }

package com.rvz.approvalservice.service;

import com.rvz.approvalservice.dto.request.ApprovalActionRequest;
import com.rvz.approvalservice.dto.request.InitiateApprovalRequest;
import com.rvz.approvalservice.dto.response.ApprovalResponse;
import java.util.List;

public interface ApprovalService {
    ApprovalResponse initiateApproval(InitiateApprovalRequest request);
    ApprovalResponse processApproval(ApprovalActionRequest request);
    ApprovalResponse getApprovalStatus(Long ticketId);

    // Project-scoped per-level queries (still used by resource owner page)
    List<ApprovalResponse> getPendingL1Approvals(String approverId);
    List<ApprovalResponse> getPendingL2Approvals(String approverId);
    List<ApprovalResponse> getPendingResourceOwnerApprovals(String approverId);

    List<ApprovalResponse> getL1History(String approverId);
    List<ApprovalResponse> getL2History(String approverId);

    // ── UNIFIED: all pending/history for an approver regardless of L1/L2 role ──
    // Returns L1-pending tickets where user is l1Approver
    //   PLUS L2-pending tickets where user is l2Approver
    // Used by the combined Approval Queue page
    List<ApprovalResponse> getPendingForApprover(String approverId);
    List<ApprovalResponse> getHistoryForApprover(String approverId);
    
    
    List<ApprovalResponse> getAllPendingL1();

    /** All tickets where L1=APPROVED and L2 status = PENDING */
    List<ApprovalResponse> getAllPendingL2();

    /**
     * All tickets that have cleared every required approval stage.
     * Non-RO tickets: l1=APPROVED + l2=APPROVED
     * RO tickets:     l1=APPROVED + l2=APPROVED + resourceOwnerStatus=APPROVED
     */
    List<ApprovalResponse> getAllFullyApproved();
}
