package com.example.studenttaskmanager.repository;

import com.example.studenttaskmanager.model.entity.Task;
import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;

import java.util.List;

/**
 * Custom repository interface for dynamic query composition.
 */
public interface TaskRepositoryCustom {

    List<Task> findTasksWithFilters(
            String search,
            TaskStatus status,
            TaskType taskType,
            Priority priority,
            Boolean overdue,
            String sortBy
    );
}
