package com.Xylem.Mjolnir.exception;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(UnauthorizedException.class)
    ResponseEntity<Map<String, Object>> unauthorized(UnauthorizedException exception) {
        return response(HttpStatus.UNAUTHORIZED, exception.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    ResponseEntity<Map<String, Object>> forbidden(ForbiddenException exception) {
        return response(HttpStatus.FORBIDDEN, exception.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<Map<String, Object>> notFound(NotFoundException exception) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler({BadRequestException.class, MethodArgumentNotValidException.class})
    ResponseEntity<Map<String, Object>> badRequest(Exception exception) {
        return response(HttpStatus.BAD_REQUEST, "Request validation failed");
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<Map<String, Object>> conflict(ConflictException exception) {
        return response(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> unexpected(Exception exception) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred");
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message));
    }
}
