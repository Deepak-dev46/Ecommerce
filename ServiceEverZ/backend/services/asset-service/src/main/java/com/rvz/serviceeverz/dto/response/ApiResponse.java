package com.rvz.serviceeverz.dto.response;

import java.time.LocalDateTime;
 
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
 
    public ApiResponse() {}
    public ApiResponse(boolean success, String message, T data) {
        this.success = success; this.message = message; this.data = data; this.timestamp = LocalDateTime.now();
    }
 
    public boolean isSuccess() { return success; } public void setSuccess(boolean v) { success = v; }
    public String getMessage() { return message; } public void setMessage(String v) { message = v; }
    public T getData() { return data; } public void setData(T v) { data = v; }
    public LocalDateTime getTimestamp() { return timestamp; } public void setTimestamp(LocalDateTime v) { timestamp = v; }
}
 