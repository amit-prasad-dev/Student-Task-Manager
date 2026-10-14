package com.example.studenttaskmanager.model.dto;

import com.example.studenttaskmanager.model.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for quick status update (PATCH /api/v1/tasks/{id}/status).
 */
public class TaskStatusUpdateDTO {

    @NotNull(message = "Status must not be null")
    private TaskStatus status;

    public TaskStatusUpdateDTO() {
    }

    public TaskStatusUpdateDTO(TaskStatus status) {
        this.status = status;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
}
