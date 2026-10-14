package com.example.studenttaskmanager.repository;

import com.example.studenttaskmanager.model.entity.Task;
import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test for TaskRepository and TaskRepositoryCustomImpl.
 * Verifies that custom JPQL queries, CASE-based priority sorting,
 * NULL-handling due date sorting, and database indexes operate as expected.
 */
@SpringBootTest
@Transactional
class TaskRepositoryTest {

    @Autowired
    private TaskRepository taskRepository;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();

        // 1. HIGH priority, Overdue (past deadline, PENDING)
        Task t1 = new Task("Calculus Problem Set 1", "Integration exercises", LocalDateTime.now().minusDays(2), Priority.HIGH, TaskStatus.PENDING, TaskType.ASSIGNMENT);
        
        // 2. MEDIUM priority, Due in 3 days, IN_PROGRESS
        Task t2 = new Task("LeetCode Binary Search", "Practice 5 questions", LocalDateTime.now().plusDays(3), Priority.MEDIUM, TaskStatus.IN_PROGRESS, TaskType.CODING_PRACTICE);
        
        // 3. LOW priority, No deadline, PENDING
        Task t3 = new Task("Operating Systems Notes", "Paging and segmentation", null, Priority.LOW, TaskStatus.PENDING, TaskType.REVISION);
        
        // 4. HIGH priority, Due in 1 day, PENDING
        Task t4 = new Task("Physics Midterm Prep", "Oscillations and waves", LocalDateTime.now().plusDays(1), Priority.HIGH, TaskStatus.PENDING, TaskType.EXAM);
        
        // 5. MEDIUM priority, Completed, past due date (should NOT count as overdue)
        Task t5 = new Task("Linear Algebra Lab", "Matrix multiplication", LocalDateTime.now().minusDays(3), Priority.MEDIUM, TaskStatus.COMPLETED, TaskType.ASSIGNMENT);

        taskRepository.saveAll(List.of(t1, t2, t3, t4, t5));
    }

    @Test
    @DisplayName("findTasksWithFilters: search by title keyword case-insensitively")
    void filterBySearch_CaseInsensitive() {
        List<Task> results = taskRepository.findTasksWithFilters("leetcode", null, null, null, null, "dueDate,asc");
        assertEquals(1, results.size());
        assertEquals("LeetCode Binary Search", results.get(0).getTitle());
    }

    @Test
    @DisplayName("findTasksWithFilters: filter by TaskStatus")
    void filterByStatus() {
        List<Task> results = taskRepository.findTasksWithFilters(null, TaskStatus.IN_PROGRESS, null, null, null, "dueDate,asc");
        assertEquals(1, results.size());
        assertEquals("LeetCode Binary Search", results.get(0).getTitle());
    }

    @Test
    @DisplayName("findTasksWithFilters: filter by TaskType")
    void filterByTaskType() {
        List<Task> results = taskRepository.findTasksWithFilters(null, null, TaskType.CODING_PRACTICE, null, null, "dueDate,asc");
        assertEquals(1, results.size());
        assertEquals(TaskType.CODING_PRACTICE, results.get(0).getTaskType());
    }

    @Test
    @DisplayName("findTasksWithFilters: filter by overdue tasks returns uncompleted tasks with past deadlines")
    void filterByOverdue() {
        List<Task> results = taskRepository.findTasksWithFilters(null, null, null, null, true, "dueDate,asc");
        assertEquals(1, results.size());
        assertEquals("Calculus Problem Set 1", results.get(0).getTitle());
        assertTrue(results.get(0).getDueDate().isBefore(LocalDateTime.now()));
        assertNotEquals(TaskStatus.COMPLETED, results.get(0).getStatus());
    }

    @Test
    @DisplayName("Priority sorting (priority,desc) respects academic precedence: HIGH -> MEDIUM -> LOW")
    void prioritySorting_Descending() {
        List<Task> results = taskRepository.findTasksWithFilters(null, null, null, null, null, "priority,desc");
        assertEquals(5, results.size());

        // First two must be HIGH
        assertEquals(Priority.HIGH, results.get(0).getPriority());
        assertEquals(Priority.HIGH, results.get(1).getPriority());

        // Next two must be MEDIUM
        assertEquals(Priority.MEDIUM, results.get(2).getPriority());
        assertEquals(Priority.MEDIUM, results.get(3).getPriority());

        // Last must be LOW
        assertEquals(Priority.LOW, results.get(4).getPriority());
    }

    @Test
    @DisplayName("Priority sorting (priority,asc) respects ascending precedence: LOW -> MEDIUM -> HIGH")
    void prioritySorting_Ascending() {
        List<Task> results = taskRepository.findTasksWithFilters(null, null, null, null, null, "priority,asc");
        assertEquals(5, results.size());

        // First must be LOW
        assertEquals(Priority.LOW, results.get(0).getPriority());

        // Next two must be MEDIUM
        assertEquals(Priority.MEDIUM, results.get(1).getPriority());
        assertEquals(Priority.MEDIUM, results.get(2).getPriority());

        // Last two must be HIGH
        assertEquals(Priority.HIGH, results.get(3).getPriority());
        assertEquals(Priority.HIGH, results.get(4).getPriority());
    }

    @Test
    @DisplayName("Due date sorting (dueDate,asc) places tasks without due date at the bottom")
    void dueDateSorting_NullsLast() {
        List<Task> results = taskRepository.findTasksWithFilters(null, null, null, null, null, "dueDate,asc");
        assertEquals(5, results.size());

        // The task with no deadline (t3) must be the last element
        assertNull(results.get(4).getDueDate(), "Tasks with null due date must appear at the end");
        assertEquals("Operating Systems Notes", results.get(4).getTitle());
    }

    @Test
    @DisplayName("Dashboard counts: countByStatus and countOverdueTasks are accurate")
    void dashboardCounts() {
        assertEquals(5, taskRepository.count());
        assertEquals(3, taskRepository.countByStatus(TaskStatus.PENDING));
        assertEquals(1, taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        assertEquals(1, taskRepository.countByStatus(TaskStatus.COMPLETED));

        // Only Calculus Problem Set 1 is overdue (t5 is COMPLETED, so excluded)
        assertEquals(1, taskRepository.countOverdueTasks(LocalDateTime.now()));
    }
}
