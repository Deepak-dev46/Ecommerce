package com.rvz.serviceeverz.entity;


import java.time.LocalDateTime;

import com.rvz.serviceeverz.enums.MappingStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "asset_mappings")
public class AssetMapping {
 
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "mapping_number", unique = true, nullable = false, length = 30)
    private String mappingNumber;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;
 
    @Column(name = "ticket_id") private Long ticketId;
    @Column(name = "requested_by_user_id") private Long requestedByUserId;
    @Column(name = "assigned_by_sp_id") private Long assignedBySpId;
    @Column(name = "approved_by_manager_id") private Long approvedByManagerId;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private MappingStatus status = MappingStatus.PENDING_SP_APPROVAL;
 
    @Column(name = "sp_remarks", columnDefinition = "TEXT") private String spRemarks;
    @Column(name = "manager_remarks", columnDefinition = "TEXT") private String managerRemarks;
    @Column(name = "additional_details_request", columnDefinition = "TEXT") private String additionalDetailsRequest;
    @Column(name = "additional_details_response", columnDefinition = "TEXT") private String additionalDetailsResponse;
 
    @Column(name = "sp_approved_at") private LocalDateTime spApprovedAt;
    @Column(name = "manager_approved_at") private LocalDateTime managerApprovedAt;
    @Column(name = "assigned_from") private LocalDateTime assignedFrom;
    @Column(name = "assigned_to") private LocalDateTime assignedTo;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
 
    @PrePersist public void prePersist() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  public void preUpdate()  { updatedAt = LocalDateTime.now(); }
 
    public Long getId() { return id; }
    public String getMappingNumber() { return mappingNumber; } public void setMappingNumber(String v) { mappingNumber = v; }
    public Asset getAsset() { return asset; } public void setAsset(Asset v) { asset = v; }
    public Long getTicketId() { return ticketId; } public void setTicketId(Long v) { ticketId = v; }
    public Long getRequestedByUserId() { return requestedByUserId; } public void setRequestedByUserId(Long v) { requestedByUserId = v; }
    public Long getAssignedBySpId() { return assignedBySpId; } public void setAssignedBySpId(Long v) { assignedBySpId = v; }
    public Long getApprovedByManagerId() { return approvedByManagerId; } public void setApprovedByManagerId(Long v) { approvedByManagerId = v; }
    public MappingStatus getStatus() { return status; } public void setStatus(MappingStatus v) { status = v; }
    public String getSpRemarks() { return spRemarks; } public void setSpRemarks(String v) { spRemarks = v; }
    public String getManagerRemarks() { return managerRemarks; } public void setManagerRemarks(String v) { managerRemarks = v; }
    public String getAdditionalDetailsRequest() { return additionalDetailsRequest; } public void setAdditionalDetailsRequest(String v) { additionalDetailsRequest = v; }
    public String getAdditionalDetailsResponse() { return additionalDetailsResponse; } public void setAdditionalDetailsResponse(String v) { additionalDetailsResponse = v; }
    public LocalDateTime getSpApprovedAt() { return spApprovedAt; } public void setSpApprovedAt(LocalDateTime v) { spApprovedAt = v; }
    public LocalDateTime getManagerApprovedAt() { return managerApprovedAt; } public void setManagerApprovedAt(LocalDateTime v) { managerApprovedAt = v; }
    public LocalDateTime getAssignedFrom() { return assignedFrom; } public void setAssignedFrom(LocalDateTime v) { assignedFrom = v; }
    public LocalDateTime getAssignedTo() { return assignedTo; } public void setAssignedTo(LocalDateTime v) { assignedTo = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}