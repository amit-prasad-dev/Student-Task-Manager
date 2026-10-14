package com.example.studenttaskmanager.service;

import com.example.studenttaskmanager.model.dto.*;
import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;

import java.util.List;

/**
 * Service interface defining business operations for student task management.
 */
public interface TaskService {

    TaskResponseDTO createTask(TaskCreateDTO createDTO);

    List<TaskResponseDTO> getAllTasks(
            String search,
            TaskStatus status,
            TaskType taskType,
            Priority priority,
            Boolean overdue,
            String sortBy
    );

    TaskResponseDTO getTaskById(Long id);

    TaskResponseDTO updateTask(Long id, TaskUpdateDTO updateDTO);

    TaskResponseDTO updateTaskStatus(Long id, TaskStatusUpdateDTO statusUpdateDTO);

    void deleteTask(Long id);

    DashboardStatsDTO getDashboardStats();
}
