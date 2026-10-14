package com.example.studenttaskmanager.model.dto;

import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for updating an existing Task.
 * 
 * Crucial Design Decision (per AGENTS.md):
 * Omits @FutureOrPresent on dueDate so students can edit notes, status,
 * or priority of existing overdue tasks without validation blocking the update.
 */
public class TaskUpdateDTO {

    @NotBlank(message = "Title must not be blank")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dueDate;

    @NotNull(message = "Priority must not be null")
    private Priority priority;

    @NotNull(message = "Status must not be null")
    private TaskStatus status;

    @NotNull(message = "Task type must not be null")
    private TaskType taskType;

    public TaskUpdateDTO() {
    }

    public TaskUpdateDTO(String title, String description, LocalDateTime dueDate, Priority priority, TaskStatus status, TaskType taskType) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.status = status;
        this.taskType = taskType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }
}
