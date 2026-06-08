package com.rvz.serviceeverz.entity;



import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "asset_mapping_history")
public class AssetMappingHistory {
 
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "mapping_id") private Long mappingId;
    @Column(name = "asset_id") private Long assetId;
    @Column(name = "asset_tag", length = 60) private String assetTag;
    @Column(name = "user_id") private Long userId;
    @Column(name = "assigned_by_sp_id") private Long assignedBySpId;
    @Column(name = "approved_by_manager_id") private Long approvedByManagerId;
    @Column(name = "ticket_id") private Long ticketId;
    @Column(name = "assigned_from") private LocalDateTime assignedFrom;
    @Column(name = "assigned_to") private LocalDateTime assignedTo;
    @Column(name = "status_at_close", length = 50) private String statusAtClose;
    @Column(name = "sp_remarks", columnDefinition = "TEXT") private String spRemarks;
    @Column(name = "manager_remarks", columnDefinition = "TEXT") private String managerRemarks;
    @Column(name = "recorded_at", updatable = false) private LocalDateTime recordedAt;
 
    @PrePersist public void prePersist() { recordedAt = LocalDateTime.now(); }
 
    public Long getId() { return id; }
    public Long getMappingId() { return mappingId; } public void setMappingId(Long v) { mappingId = v; }
    public Long getAssetId() { return assetId; } public void setAssetId(Long v) { assetId = v; }
    public String getAssetTag() { return assetTag; } public void setAssetTag(String v) { assetTag = v; }
    public Long getUserId() { return userId; } public void setUserId(Long v) { userId = v; }
    public Long getAssignedBySpId() { return assignedBySpId; } public void setAssignedBySpId(Long v) { assignedBySpId = v; }
    public Long getApprovedByManagerId() { return approvedByManagerId; } public void setApprovedByManagerId(Long v) { approvedByManagerId = v; }
    public Long getTicketId() { return ticketId; } public void setTicketId(Long v) { ticketId = v; }
    public LocalDateTime getAssignedFrom() { return assignedFrom; } public void setAssignedFrom(LocalDateTime v) { assignedFrom = v; }
    public LocalDateTime getAssignedTo() { return assignedTo; } public void setAssignedTo(LocalDateTime v) { assignedTo = v; }
    public String getStatusAtClose() { return statusAtClose; } public void setStatusAtClose(String v) { statusAtClose = v; }
    public String getSpRemarks() { return spRemarks; } public void setSpRemarks(String v) { spRemarks = v; }
    public String getManagerRemarks() { return managerRemarks; } public void setManagerRemarks(String v) { managerRemarks = v; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
}