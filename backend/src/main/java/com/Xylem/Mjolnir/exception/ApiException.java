package com.Xylem.Mjolnir.exception;

public abstract class ApiException extends RuntimeException {
    protected ApiException(String message) {
        super(message);
    }
}
