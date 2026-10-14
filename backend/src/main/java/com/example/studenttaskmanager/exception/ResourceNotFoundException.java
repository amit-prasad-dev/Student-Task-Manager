package com.example.studenttaskmanager.exception;

/**
 * Exception thrown when a requested resource (e.g., Task) cannot be found by its identifier.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
