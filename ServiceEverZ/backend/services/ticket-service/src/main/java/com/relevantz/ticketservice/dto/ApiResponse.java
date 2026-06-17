package com.relevantz.ticketservice.dto;

import java.time.LocalDateTime;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public ApiResponse() {}
    public boolean isSuccess()             { return success; }
    public void setSuccess(boolean v)      { this.success = v; }
    public String getMessage()             { return message; }
    public void setMessage(String v)       { this.message = v; }
    public T getData()                     { return data; }
    public void setData(T v)               { this.data = v; }
    public LocalDateTime getTimestamp()    { return timestamp; }
    public void setTimestamp(LocalDateTime v) { this.timestamp = v; }
}
