package com.rvz.serviceeverz.dto.response;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public ApiResponse() {}
    public ApiResponse(boolean success, String message, T data) {
        this.success = success; this.message = message; this.data = data;
    }
    public boolean isSuccess() { return success; } public void setSuccess(boolean v) { success = v; }
    public String getMessage() { return message; } public void setMessage(String v) { message = v; }
    public T getData() { return data; } public void setData(T v) { data = v; }
}
