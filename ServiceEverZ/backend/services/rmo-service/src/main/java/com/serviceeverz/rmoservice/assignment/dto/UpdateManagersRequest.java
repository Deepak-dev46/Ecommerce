package com.serviceeverz.rmoservice.assignment.dto;
 
import jakarta.validation.constraints.NotNull;
 
public class UpdateManagersRequest {
 
    @NotNull(message = "Resource Owner ID is required")
    private Long resourceOwnerId;
 
    @NotNull(message = "L1 Manager ID is required")
    private Long l1ManagerId;
 
    @NotNull(message = "L2 Manager ID is required")
    private Long l2ManagerId;
 
    public Long getResourceOwnerId() {
        return resourceOwnerId;
    }
 
    public void setResourceOwnerId(Long resourceOwnerId) {
        this.resourceOwnerId = resourceOwnerId;
    }
 
    public Long getL1ManagerId() {
        return l1ManagerId;
    }
 
    public void setL1ManagerId(Long l1ManagerId) {
        this.l1ManagerId = l1ManagerId;
    }
 
    public Long getL2ManagerId() {
        return l2ManagerId;
    }
 
    public void setL2ManagerId(Long l2ManagerId) {
        this.l2ManagerId = l2ManagerId;
    }
}
 