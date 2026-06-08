package com.rvz.serviceeverz.exception;

public class ChangeManagementException extends RuntimeException {
    public ChangeManagementException(String message) { super(message); }
    public ChangeManagementException(String message, Throwable cause) { super(message, cause); }
}
