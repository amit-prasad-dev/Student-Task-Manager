package com.example.studenttaskmanager.controller;

import com.example.studenttaskmanager.exception.ResourceNotFoundException;
import com.example.studenttaskmanager.model.dto.*;
import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;
import com.example.studenttaskmanager.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web layer tests for TaskController and DashboardController.
 * Validates request mapping, bean validation (@Valid), HTTP response codes, and JSON serialization.
 */
@WebMvcTest(controllers = {TaskController.class, DashboardController.class})
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @Test
    @DisplayName("GET /api/v1/tasks should return 200 OK and JSON list of tasks")
    void getAllTasks_Returns200AndList() throws Exception {
        TaskResponseDTO dto = new TaskResponseDTO(
                1L,
                "DSA Trees Revision",
                "Review Binary Search Trees",
                LocalDateTime.of(2026, 10, 20, 18, 0, 0),
                Priority.HIGH,
                TaskStatus.PENDING,
                TaskType.CODING_PRACTICE,
                false,
                LocalDateTime.of(2026, 10, 14, 10, 0, 0),
                LocalDateTime.of(2026, 10, 14, 10, 0, 0)
        );

        when(taskService.getAllTasks(any(), any(), any(), any(), any(), any())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/tasks")
                        .param("search", "Trees")
                        .param("sortBy", "dueDate,asc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is("DSA Trees Revision")))
                .andExpect(jsonPath("$[0].priority", is("HIGH")))
                .andExpect(jsonPath("$[0].isOverdue", is(false)));
    }

    @Test
    @DisplayName("GET /api/v1/tasks/{id} returns 200 OK when task exists")
    void getTaskById_Found_Returns200() throws Exception {
        TaskResponseDTO dto = new TaskResponseDTO(
                1L,
                "Calculus Preparation",
                "Limits and Continuity",
                null,
                Priority.MEDIUM,
                TaskStatus.IN_PROGRESS,
                TaskType.EXAM,
                false,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        when(taskService.getTaskById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/tasks/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Calculus Preparation")));
    }

    @Test
    @DisplayName("GET /api/v1/tasks/{id} returns 404 Not Found when task is missing")
    void getTaskById_NotFound_Returns404() throws Exception {
        when(taskService.getTaskById(99L))
                .thenThrow(new ResourceNotFoundException("Task not found with ID: 99"));

        Instant requestStarted = Instant.now();
        var result = mockMvc.perform(get("/api/v1/tasks/99")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString("Task not found with ID: 99")))
                .andExpect(jsonPath("$.path", is("/api/v1/tasks/99")))
                .andReturn();

        Instant responseTimestamp = Instant.parse(
                com.jayway.jsonpath.JsonPath.read(result.getResponse().getContentAsString(), "$.timestamp")
        );
        assertFalse(responseTimestamp.isBefore(requestStarted.minusSeconds(1)));
        assertFalse(responseTimestamp.isAfter(Instant.now().plusSeconds(1)));
    }

    @Test
    @DisplayName("POST /api/v1/tasks returns 201 Created on valid task creation")
    void createTask_Valid_Returns201() throws Exception {
        TaskResponseDTO responseDTO = new TaskResponseDTO(
                5L,
                "Calculus Quiz 2 Preparation",
                "Solve practice set 4 on integration by parts.",
                LocalDateTime.of(2026, 10, 25, 10, 0, 0),
                Priority.MEDIUM,
                TaskStatus.PENDING,
                TaskType.EXAM,
                false,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        when(taskService.createTask(any(TaskCreateDTO.class))).thenReturn(responseDTO);

        String jsonPayload = """
                {
                    "title": "Calculus Quiz 2 Preparation",
                    "description": "Solve practice set 4 on integration by parts.",
                    "dueDate": "2026-10-25T10:00:00",
                    "priority": "MEDIUM",
                    "status": "PENDING",
                    "taskType": "EXAM"
                }
                """;

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(5)))
                .andExpect(jsonPath("$.title", is("Calculus Quiz 2 Preparation")))
                .andExpect(jsonPath("$.priority", is("MEDIUM")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.taskType", is("EXAM")));
    }

    @Test
    @DisplayName("POST /api/v1/tasks returns 400 Bad Request when title is blank or too short")
    void createTask_InvalidTitle_Returns400() throws Exception {
        String invalidPayload = """
                {
                    "title": "",
                    "description": "Short description",
                    "dueDate": "2026-10-25T10:00:00",
                    "priority": "LOW",
                    "status": "PENDING",
                    "taskType": "ASSIGNMENT"
                }
                """;

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.fieldErrors", hasSize(greaterThanOrEqualTo(1))));

        verify(taskService, never()).createTask(any());
    }

    @Test
    @DisplayName("POST /api/v1/tasks returns 400 Bad Request when due date is in the past")
    void createTask_PastDueDate_Returns400() throws Exception {
        String pastDatePayload = """
                {
                    "title": "Past Assignment Task",
                    "description": "Old description",
                    "dueDate": "2020-01-01T12:00:00",
                    "priority": "LOW",
                    "status": "PENDING",
                    "taskType": "ASSIGNMENT"
                }
                """;

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pastDatePayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.fieldErrors[0].field", is("dueDate")))
                .andExpect(jsonPath("$.fieldErrors[0].message", is("Due date must be in the present or future")));

        verify(taskService, never()).createTask(any());
    }

    @Test
    @DisplayName("POST /api/v1/tasks accepts a null optional due date")
    void createTask_NullDueDate_Returns201() throws Exception {
        TaskResponseDTO responseDTO = new TaskResponseDTO(
                6L,
                "Study without a deadline",
                null,
                null,
                Priority.MEDIUM,
                TaskStatus.PENDING,
                TaskType.REVISION,
                false,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        when(taskService.createTask(any(TaskCreateDTO.class))).thenReturn(responseDTO);

        String jsonPayload = """
                {
                    "title": "Study without a deadline",
                    "dueDate": null,
                    "priority": "MEDIUM",
                    "status": "PENDING",
                    "taskType": "REVISION"
                }
                """;

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dueDate").value(nullValue()));
    }

    @Test
    @DisplayName("PUT /api/v1/tasks/{id} allows editing overdue tasks with past due dates")
    void updateTask_AllowsPastDueDateOnExistingTask() throws Exception {
        // Crucial test verifying decoupled validation rule: TaskUpdateDTO permits past dates
        TaskResponseDTO responseDTO = new TaskResponseDTO(
                1L,
                "Updated Overdue Task",
                "Still working on this past deadline",
                LocalDateTime.of(2025, 1, 1, 12, 0, 0),
                Priority.HIGH,
                TaskStatus.IN_PROGRESS,
                TaskType.ASSIGNMENT,
                true,
                LocalDateTime.now().minusDays(10),
                LocalDateTime.now()
        );

        when(taskService.updateTask(eq(1L), any(TaskUpdateDTO.class))).thenReturn(responseDTO);

        String updatePayload = """
                {
                    "title": "Updated Overdue Task",
                    "description": "Still working on this past deadline",
                    "dueDate": "2025-01-01T12:00:00",
                    "priority": "HIGH",
                    "status": "IN_PROGRESS",
                    "taskType": "ASSIGNMENT"
                }
                """;

        mockMvc.perform(put("/api/v1/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Updated Overdue Task")))
                .andExpect(jsonPath("$.isOverdue", is(true)));
    }

    @Test
    @DisplayName("PATCH /api/v1/tasks/{id}/status quickly updates status")
    void updateTaskStatus_Returns200() throws Exception {
        TaskResponseDTO responseDTO = new TaskResponseDTO(
                1L,
                "Task Title",
                "Description",
                null,
                Priority.MEDIUM,
                TaskStatus.COMPLETED,
                TaskType.ASSIGNMENT,
                false,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        when(taskService.updateTaskStatus(eq(1L), any(TaskStatusUpdateDTO.class))).thenReturn(responseDTO);

        String patchPayload = """
                {
                    "status": "COMPLETED"
                }
                """;

        mockMvc.perform(patch("/api/v1/tasks/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    @DisplayName("DELETE /api/v1/tasks/{id} returns 204 No Content")
    void deleteTask_Returns204() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/v1/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(1L);
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/stats returns 200 OK with summary statistics")
    void getDashboardStats_Returns200() throws Exception {
        DashboardStatsDTO stats = new DashboardStatsDTO(15, 6, 4, 5, 2);
        when(taskService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/dashboard/stats")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks", is(15)))
                .andExpect(jsonPath("$.pendingTasks", is(6)))
                .andExpect(jsonPath("$.inProgressTasks", is(4)))
                .andExpect(jsonPath("$.completedTasks", is(5)))
                .andExpect(jsonPath("$.overdueTasks", is(2)));
    }
}
