package com.example.studenttaskmanager.repository;

import com.example.studenttaskmanager.model.entity.Task;
import com.example.studenttaskmanager.model.enums.Priority;
import com.example.studenttaskmanager.model.enums.TaskStatus;
import com.example.studenttaskmanager.model.enums.TaskType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of custom task filtering and sorting logic.
 * 
 * Uses dynamic JPQL query creation to:
 * 1. Filter conditionally by keyword search, status, taskType, priority, and overdue state.
 * 2. Apply academic urgency sorting conventions (e.g. HIGH -> MEDIUM -> LOW priority,
 *    and placing null deadlines at the bottom for due date sorting).
 */
@Repository
public class TaskRepositoryCustomImpl implements TaskRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Task> findTasksWithFilters(
            String search,
            TaskStatus status,
            TaskType taskType,
            Priority priority,
            Boolean overdue,
            String sortBy
    ) {
        StringBuilder jpql = new StringBuilder("SELECT t FROM Task t WHERE 1=1 ");
        Map<String, Object> parameters = new HashMap<>();

        if (search != null && !search.trim().isEmpty()) {
            jpql.append("AND LOWER(t.title) LIKE :searchPattern ");
            parameters.put("searchPattern", "%" + search.trim().toLowerCase() + "%");
        }

        if (status != null) {
            jpql.append("AND t.status = :status ");
            parameters.put("status", status);
        }

        if (taskType != null) {
            jpql.append("AND t.taskType = :taskType ");
            parameters.put("taskType", taskType);
        }

        if (priority != null) {
            jpql.append("AND t.priority = :priority ");
            parameters.put("priority", priority);
        }

        if (Boolean.TRUE.equals(overdue)) {
            jpql.append("AND t.status != :completedStatus AND t.dueDate IS NOT NULL AND t.dueDate < :now ");
            parameters.put("completedStatus", TaskStatus.COMPLETED);
            parameters.put("now", LocalDateTime.now());
        }

        // Apply Sorting convention
        String orderClause = resolveOrderClause(sortBy);
        jpql.append(orderClause);

        TypedQuery<Task> query = entityManager.createQuery(jpql.toString(), Task.class);
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }

        return query.getResultList();
    }

    private String resolveOrderClause(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            // Default: nearest deadline first, tasks without deadline at the bottom
            return "ORDER BY CASE WHEN t.dueDate IS NULL THEN 1 ELSE 0 END ASC, t.dueDate ASC, t.id ASC ";
        }

        String normalized = sortBy.trim().toLowerCase();

        switch (normalized) {
            case "duedate,desc":
                return "ORDER BY CASE WHEN t.dueDate IS NULL THEN 1 ELSE 0 END ASC, t.dueDate DESC, t.id DESC ";

            case "duedate,asc":
                return "ORDER BY CASE WHEN t.dueDate IS NULL THEN 1 ELSE 0 END ASC, t.dueDate ASC, t.id ASC ";

            case "priority,desc":
                // Academic urgency: HIGH (1) -> MEDIUM (2) -> LOW (3)
                return "ORDER BY CASE t.priority " +
                        "WHEN com.example.studenttaskmanager.model.enums.Priority.HIGH THEN 1 " +
                        "WHEN com.example.studenttaskmanager.model.enums.Priority.MEDIUM THEN 2 " +
                        "WHEN com.example.studenttaskmanager.model.enums.Priority.LOW THEN 3 " +
                        "ELSE 4 END ASC, t.id DESC ";

            case "priority,asc":
                // Ascending urgency: LOW (3) -> MEDIUM (2) -> HIGH (1)
                return "ORDER BY CASE t.priority " +
                        "WHEN com.example.studenttaskmanager.model.enums.Priority.HIGH THEN 1 " +
                        "WHEN com.example.studenttaskmanager.model.enums.Priority.MEDIUM THEN 2 " +
                        "WHEN com.example.studenttaskmanager.model.enums.Priority.LOW THEN 3 " +
                        "ELSE 4 END DESC, t.id ASC ";

            case "createdat,desc":
                return "ORDER BY t.createdAt DESC, t.id DESC ";

            case "createdat,asc":
                return "ORDER BY t.createdAt ASC, t.id ASC ";

            default:
                return "ORDER BY CASE WHEN t.dueDate IS NULL THEN 1 ELSE 0 END ASC, t.dueDate ASC, t.id ASC ";
        }
    }
}
