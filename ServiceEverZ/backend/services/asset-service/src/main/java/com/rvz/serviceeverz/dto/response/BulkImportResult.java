package com.rvz.serviceeverz.dto.response;

import java.util.List;
 
public class BulkImportResult {
    private int totalRows, successCount, failureCount;
    private List<String> errors;
 
    public int getTotalRows() { return totalRows; } public void setTotalRows(int v) { totalRows = v; }
    public int getSuccessCount() { return successCount; } public void setSuccessCount(int v) { successCount = v; }
    public int getFailureCount() { return failureCount; } public void setFailureCount(int v) { failureCount = v; }
    public List<String> getErrors() { return errors; } public void setErrors(List<String> v) { errors = v; }
}
 