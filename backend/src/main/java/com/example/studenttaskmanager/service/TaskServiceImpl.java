package com.example.studenttaskmanager.service;

import com.example.studenttaskmanager.exception.ResourceNotFoundException;
import com.example.studenttaskmanager.model.dto.*;
import com.example.studenttaskmanager.model.entity.Task;
import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;
import com.example.studenttaskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation containing the core business logic for study task management.
 * 
 * - @Service registers this class as a Spring-managed bean in the application context.
 * - @Transactional ensures database operations within methods run within a transaction boundary.
 */
@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    /**
     * Constructor injection: Preferred over field injection (@Autowired on fields)
     * because it guarantees immutability, facilitates unit testing with mocks,
     * and makes dependencies explicit.
     */
    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public TaskResponseDTO createTask(TaskCreateDTO createDTO) {
        Task task = new Task();
        task.setTitle(createDTO.getTitle().trim());
        task.setDescription(createDTO.getDescription() != null ? createDTO.getDescription().trim() : null);
        task.setDueDate(createDTO.getDueDate());
        task.setPriority(createDTO.getPriority() != null ? createDTO.getPriority() : Priority.MEDIUM);
        task.setStatus(createDTO.getStatus() != null ? createDTO.getStatus() : TaskStatus.PENDING);
        task.setTaskType(createDTO.getTaskType() != null ? createDTO.getTaskType() : TaskType.ASSIGNMENT);

        Task savedTask = taskRepository.save(task);
        return TaskResponseDTO.fromEntity(savedTask);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getAllTasks(
            String search,
            TaskStatus status,
            TaskType taskType,
            Priority priority,
            Boolean overdue,
            String sortBy
    ) {
        List<Task> tasks = taskRepository.findTasksWithFilters(search, status, taskType, priority, overdue, sortBy);
        return tasks.stream()
                .map(TaskResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponseDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));
        return TaskResponseDTO.fromEntity(task);
    }

    @Override
    public TaskResponseDTO updateTask(Long id, TaskUpdateDTO updateDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));

        task.setTitle(updateDTO.getTitle().trim());
        task.setDescription(updateDTO.getDescription() != null ? updateDTO.getDescription().trim() : null);
        task.setDueDate(updateDTO.getDueDate());
        task.setPriority(updateDTO.getPriority());
        task.setStatus(updateDTO.getStatus());
        task.setTaskType(updateDTO.getTaskType());

        Task updatedTask = taskRepository.save(task);
        return TaskResponseDTO.fromEntity(updatedTask);
    }

    @Override
    public TaskResponseDTO updateTaskStatus(Long id, TaskStatusUpdateDTO statusUpdateDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));

        task.setStatus(statusUpdateDTO.getStatus());
        Task updatedTask = taskRepository.save(task);
        return TaskResponseDTO.fromEntity(updatedTask);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));
        taskRepository.delete(task);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long total = taskRepository.count();
        long pending = taskRepository.countByStatus(TaskStatus.PENDING);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long completed = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long overdue = taskRepository.countOverdueTasks(LocalDateTime.now());

        return new DashboardStatsDTO(total, pending, inProgress, completed, overdue);
    }
}
