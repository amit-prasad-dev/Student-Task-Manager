package com.example.studenttaskmanager.controller;

import com.example.studenttaskmanager.model.dto.*;
import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;
import com.example.studenttaskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller exposing CRUD and search/filter/sort endpoints for study tasks.
 * Base Path: /api/v1/tasks
 */
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * GET /api/v1/tasks
     * Retrieves all tasks matching optional search, status, type, priority, and overdue filters,
     * sorted according to academic urgency or creation date.
     */
    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> getAllTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskType taskType,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Boolean overdue,
            @RequestParam(required = false, defaultValue = "dueDate,asc") String sortBy
    ) {
        List<TaskResponseDTO> tasks = taskService.getAllTasks(search, status, taskType, priority, overdue, sortBy);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/v1/tasks/{id}
     * Retrieves a single task by its database ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable Long id) {
        TaskResponseDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    /**
     * POST /api/v1/tasks
     * Creates a new study task. Validates input bounds and ensures due dates are not in the past.
     */
    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskCreateDTO createDTO) {
        TaskResponseDTO createdTask = taskService.createTask(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    /**
     * PUT /api/v1/tasks/{id}
     * Replaces all fields of an existing task.
     * Allows editing overdue tasks without forcing deadline changes.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskUpdateDTO updateDTO
    ) {
        TaskResponseDTO updatedTask = taskService.updateTask(id, updateDTO);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * PATCH /api/v1/tasks/{id}/status
     * Quick status toggle (e.g. marking PENDING -> IN_PROGRESS or COMPLETED).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponseDTO> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateDTO statusUpdateDTO
    ) {
        TaskResponseDTO updatedTask = taskService.updateTaskStatus(id, statusUpdateDTO);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * DELETE /api/v1/tasks/{id}
     * Deletes a study task by its database ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
