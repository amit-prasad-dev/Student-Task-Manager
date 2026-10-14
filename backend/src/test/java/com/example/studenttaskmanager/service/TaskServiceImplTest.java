package com.example.studenttaskmanager.service;

import com.example.studenttaskmanager.exception.ResourceNotFoundException;
import com.example.studenttaskmanager.model.dto.*;
import com.example.studenttaskmanager.model.entity.Task;
import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;
import com.example.studenttaskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TaskServiceImpl using JUnit 5 and Mockito.
 * Tests business logic and validations without requiring a live database connection.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new Task(
                "LeetCode 75 Practice",
                "Solve 3 tree questions",
                LocalDateTime.now().plusDays(2),
                Priority.HIGH,
                TaskStatus.PENDING,
                TaskType.CODING_PRACTICE
        );
        sampleTask.setId(1L);
        sampleTask.setCreatedAt(LocalDateTime.now().minusHours(1));
        sampleTask.setUpdatedAt(LocalDateTime.now().minusHours(1));
    }

    @Test
    @DisplayName("createTask should successfully persist entity and apply default values when omitted")
    void createTask_AppliesDefaultsAndSaves() {
        TaskCreateDTO dto = new TaskCreateDTO();
        dto.setTitle("  Study Operating Systems  ");
        dto.setDescription("Process scheduling notes");
        dto.setDueDate(LocalDateTime.now().plusDays(3));
        dto.setPriority(null);
        dto.setStatus(null);
        dto.setTaskType(null);

        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task toSave = invocation.getArgument(0);
            toSave.setId(10L);
            toSave.setCreatedAt(LocalDateTime.now());
            toSave.setUpdatedAt(LocalDateTime.now());
            return toSave;
        });

        TaskResponseDTO response = taskService.createTask(dto);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Study Operating Systems", response.getTitle());
        assertEquals(Priority.MEDIUM, response.getPriority(), "Priority should default to MEDIUM");
        assertEquals(TaskStatus.PENDING, response.getStatus(), "Status should default to PENDING");
        assertEquals(TaskType.ASSIGNMENT, response.getTaskType(), "TaskType should default to ASSIGNMENT");
        assertFalse(response.isOverdue());

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(captor.capture());
        assertEquals("Study Operating Systems", captor.getValue().getTitle());
    }

    @Test
    @DisplayName("getAllTasks should delegate to repository with filters and map results to DTOs")
    void getAllTasks_Success() {
        when(taskRepository.findTasksWithFilters(eq("LeetCode"), eq(TaskStatus.PENDING), isNull(), isNull(), isNull(), anyString()))
                .thenReturn(List.of(sampleTask));

        List<TaskResponseDTO> results = taskService.getAllTasks("LeetCode", TaskStatus.PENDING, null, null, null, "dueDate,asc");

        assertEquals(1, results.size());
        assertEquals("LeetCode 75 Practice", results.get(0).getTitle());
        verify(taskRepository).findTasksWithFilters("LeetCode", TaskStatus.PENDING, null, null, null, "dueDate,asc");
    }

    @Test
    @DisplayName("getTaskById should return TaskResponseDTO when found")
    void getTaskById_Found() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

        TaskResponseDTO response = taskService.getTaskById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("LeetCode 75 Practice", response.getTitle());
    }

    @Test
    @DisplayName("getTaskById should throw ResourceNotFoundException when task does not exist")
    void getTaskById_NotFound_ThrowsException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> taskService.getTaskById(99L)
        );

        assertTrue(exception.getMessage().contains("Task not found with ID: 99"));
    }

    @Test
    @DisplayName("updateTask should modify existing fields and return updated TaskResponseDTO")
    void updateTask_Success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskUpdateDTO updateDTO = new TaskUpdateDTO(
                "Updated LeetCode Title",
                "New description",
                LocalDateTime.now().plusDays(5),
                Priority.LOW,
                TaskStatus.IN_PROGRESS,
                TaskType.REVISION
        );

        TaskResponseDTO response = taskService.updateTask(1L, updateDTO);

        assertNotNull(response);
        assertEquals("Updated LeetCode Title", response.getTitle());
        assertEquals("New description", response.getDescription());
        assertEquals(Priority.LOW, response.getPriority());
        assertEquals(TaskStatus.IN_PROGRESS, response.getStatus());
        assertEquals(TaskType.REVISION, response.getTaskType());
    }

    @Test
    @DisplayName("updateTaskStatus should update task status only")
    void updateTaskStatus_Success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskStatusUpdateDTO statusDTO = new TaskStatusUpdateDTO(TaskStatus.COMPLETED);
        TaskResponseDTO response = taskService.updateTaskStatus(1L, statusDTO);

        assertNotNull(response);
        assertEquals(TaskStatus.COMPLETED, response.getStatus());
        assertFalse(response.isOverdue(), "Completed tasks should not be overdue");
    }

    @Test
    @DisplayName("deleteTask should delete task if found")
    void deleteTask_Success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        doNothing().when(taskRepository).delete(sampleTask);

        assertDoesNotThrow(() -> taskService.deleteTask(1L));
        verify(taskRepository).delete(sampleTask);
    }

    @Test
    @DisplayName("deleteTask should throw ResourceNotFoundException if task does not exist")
    void deleteTask_NotFound_ThrowsException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.deleteTask(99L));
        verify(taskRepository, never()).delete(any());
    }

    @Test
    @DisplayName("getDashboardStats should compute correct counts from repository")
    void getDashboardStats_Success() {
        when(taskRepository.count()).thenReturn(10L);
        when(taskRepository.countByStatus(TaskStatus.PENDING)).thenReturn(4L);
        when(taskRepository.countByStatus(TaskStatus.IN_PROGRESS)).thenReturn(3L);
        when(taskRepository.countByStatus(TaskStatus.COMPLETED)).thenReturn(3L);
        when(taskRepository.countOverdueTasks(any(LocalDateTime.class))).thenReturn(2L);

        DashboardStatsDTO stats = taskService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalTasks());
        assertEquals(4L, stats.getPendingTasks());
        assertEquals(3L, stats.getInProgressTasks());
        assertEquals(3L, stats.getCompletedTasks());
        assertEquals(2L, stats.getOverdueTasks());
    }

    @Test
    @DisplayName("TaskResponseDTO correctly identifies overdue tasks")
    void taskResponseDTO_OverdueCalculation() {
        // 1. Overdue: past due date + PENDING
        Task overdueTask = new Task("Overdue Assignment", null, LocalDateTime.now().minusDays(1), Priority.HIGH, TaskStatus.PENDING, TaskType.ASSIGNMENT);
        assertTrue(TaskResponseDTO.fromEntity(overdueTask).isOverdue());

        // 2. Not overdue: past due date + COMPLETED
        Task completedTask = new Task("Completed Assignment", null, LocalDateTime.now().minusDays(1), Priority.HIGH, TaskStatus.COMPLETED, TaskType.ASSIGNMENT);
        assertFalse(TaskResponseDTO.fromEntity(completedTask).isOverdue());

        // 3. Not overdue: future due date + PENDING
        Task futureTask = new Task("Future Exam", null, LocalDateTime.now().plusDays(2), Priority.HIGH, TaskStatus.PENDING, TaskType.EXAM);
        assertFalse(TaskResponseDTO.fromEntity(futureTask).isOverdue());

        // 4. Not overdue: no due date
        Task noDateTask = new Task("No Deadline Revision", null, null, Priority.LOW, TaskStatus.PENDING, TaskType.REVISION);
        assertFalse(TaskResponseDTO.fromEntity(noDateTask).isOverdue());
    }
}
