package com.rvz.reportservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidFilterException extends RuntimeException {

    private final String field;
    private final Object rejectedValue;

    public InvalidFilterException(String message) {
        super(message);
        this.field = null;
        this.rejectedValue = null;
    }

    public InvalidFilterException(String field, Object rejectedValue, String message) {
        super("Invalid filter [" + field + "=" + rejectedValue + "]: " + message);
        this.field = field;
        this.rejectedValue = rejectedValue;
    }

    public String getField() { return field; }
    public Object getRejectedValue() { return rejectedValue; }
}
