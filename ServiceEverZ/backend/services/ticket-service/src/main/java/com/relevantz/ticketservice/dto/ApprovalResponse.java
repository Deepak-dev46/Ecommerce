package com.relevantz.ticketservice.dto;

/**
 * FIXED: No longer maps from TicketQueue (wrong table).
 * Now represents a flattened view of ticket_approvals record from approval-service,
 * used in TicketResponse.approvals[] for MyTickets detail view.
 */
import java.util.Map;
public class ApprovalResponse {

    private Long   approvalId;
    private Long   ticketId;

    // L1
    private String l1ApproverId;
    private String l1ApproverName;
    private String l1Status;

    // L2
    private String l2ApproverId;
    private String l2ApproverName;
    private String l2Status;

    // Overall
    private String overallStatus;
    private String remarks;

    /** Build from the Map returned by ApprovalClient.getApprovalByTicket() */
    @SuppressWarnings("unchecked")
    public static ApprovalResponse fromMap(java.util.Map<String, Object> apiResp) {
        if (apiResp == null) return null;
        // ApiResponse wrapper: { success, data: { approvalId, l1Status, ... } }
        Object dataObj = apiResp.get("data");
        if (!(dataObj instanceof java.util.Map)) return null;
        java.util.Map<String, Object> d = (java.util.Map<String, Object>) dataObj;

        ApprovalResponse r = new ApprovalResponse();
        r.setApprovalId(toLong(d.get("approvalId")));
        r.setTicketId(toLong(d.get("ticketId")));
        r.setL1ApproverId(str(d.get("l1ApproverId")));
        r.setL1ApproverName(str(d.get("l1ApproverName")));
        r.setL1Status(str(d.get("l1Status")));
        r.setL2ApproverId(str(d.get("l2ApproverId")));
        r.setL2ApproverName(str(d.get("l2ApproverName")));
        r.setL2Status(str(d.get("l2Status")));
        r.setOverallStatus(str(d.get("overallStatus")));
        r.setRemarks(str(d.get("remarks")));
        return r;
    }

    private static Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }
    private static String str(Object o) { return o != null ? o.toString() : null; }

    public Long   getApprovalId()      { return approvalId; }
    public void   setApprovalId(Long v){ this.approvalId = v; }
    public Long   getTicketId()        { return ticketId; }
    public void   setTicketId(Long v)  { this.ticketId = v; }
    public String getL1ApproverId()    { return l1ApproverId; }
    public void   setL1ApproverId(String v){ this.l1ApproverId = v; }
    public String getL1ApproverName()  { return l1ApproverName; }
    public void   setL1ApproverName(String v){ this.l1ApproverName = v; }
    public String getL1Status()        { return l1Status; }
    public void   setL1Status(String v){ this.l1Status = v; }
    public String getL2ApproverId()    { return l2ApproverId; }
    public void   setL2ApproverId(String v){ this.l2ApproverId = v; }
    public String getL2ApproverName()  { return l2ApproverName; }
    public void   setL2ApproverName(String v){ this.l2ApproverName = v; }
    public String getL2Status()        { return l2Status; }
    public void   setL2Status(String v){ this.l2Status = v; }
    public String getOverallStatus()   { return overallStatus; }
    public void   setOverallStatus(String v){ this.overallStatus = v; }
    public String getRemarks()         { return remarks; }
    public void   setRemarks(String v) { this.remarks = v; }
}
