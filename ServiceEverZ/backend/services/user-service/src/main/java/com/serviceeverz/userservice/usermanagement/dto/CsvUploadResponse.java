package com.serviceeverz.userservice.usermanagement.dto;
 
import java.util.List;
 
public class CsvUploadResponse {
 
    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<UserResponse> createdUsers;
    private List<String> failedRows;
 
    public CsvUploadResponse(int totalRows, int successCount, int failedCount,
                             List<UserResponse> createdUsers, List<String> failedRows) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.failedCount = failedCount;
        this.createdUsers = createdUsers;
        this.failedRows = failedRows;
    }
 
    public int getTotalRows() {
        return totalRows;
    }
 
    public int getSuccessCount() {
        return successCount;
    }
 
    public int getFailedCount() {
        return failedCount;
    }
 
    public List<UserResponse> getCreatedUsers() {
        return createdUsers;
    }
 
    public List<String> getFailedRows() {
        return failedRows;
    }
}
 