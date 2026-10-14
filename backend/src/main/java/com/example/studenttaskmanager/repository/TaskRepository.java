package com.example.studenttaskmanager.repository;

import com.example.studenttaskmanager.model.entity.Task;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Spring Data JPA Repository for Task entity.
 * 
 * Inherits standard CRUD operations from JpaRepository, custom filter methods
 * from TaskRepositoryCustom, and defines targeted counting queries for dashboard statistics.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, TaskRepositoryCustom {

    long countByStatus(TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status != com.example.studenttaskmanager.model.enums.TaskStatus.COMPLETED AND t.dueDate IS NOT NULL AND t.dueDate < :now")
    long countOverdueTasks(@Param("now") LocalDateTime now);
}
