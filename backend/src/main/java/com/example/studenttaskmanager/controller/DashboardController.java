package com.example.studenttaskmanager.controller;

import com.example.studenttaskmanager.model.dto.DashboardStatsDTO;
import com.example.studenttaskmanager.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller providing aggregated statistics for the student study dashboard.
 * Base Path: /api/v1/dashboard
 */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final TaskService taskService;

    public DashboardController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * GET /api/v1/dashboard/stats
     * Returns total, pending, in-progress, completed, and overdue task counts.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = taskService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
