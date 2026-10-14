import { useState } from 'react';

/**
 * Maps task enums to friendly UI labels and badge CSS classes.
 */
const TASK_TYPE_MAP = {
  ASSIGNMENT: { label: 'Assignment', badgeClass: 'badge-type-assignment' },
  CODING_PRACTICE: { label: 'Coding Practice', badgeClass: 'badge-type-coding' },
  EXAM: { label: 'Exam', badgeClass: 'badge-type-exam' },
  REVISION: { label: 'Revision', badgeClass: 'badge-type-revision' },
};

const PRIORITY_MAP = {
  HIGH: { label: 'High Priority', badgeClass: 'badge-priority-high' },
  MEDIUM: { label: 'Medium Priority', badgeClass: 'badge-priority-medium' },
  LOW: { label: 'Low Priority', badgeClass: 'badge-priority-low' },
};

function formatDeadline(isoString) {
  if (!isoString) {
    return { formatted: 'No deadline', relative: null };
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return { formatted: isoString, relative: null };
  }

  const formatted = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let relative;
  if (diffMs < 0) {
    const overdueDays = Math.max(1, Math.abs(diffDays));
    relative = `${overdueDays}d overdue`;
  } else if (diffDays === 0) {
    relative = 'Due today';
  } else if (diffDays === 1) {
    relative = 'Due tomorrow';
  } else {
    relative = `Due in ${diffDays}d`;
  }

  return { formatted, relative };
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);

  const typeConfig = TASK_TYPE_MAP[task.taskType] || {
    label: task.taskType,
    badgeClass: 'badge-type-assignment',
  };

  const priorityConfig = PRIORITY_MAP[task.priority] || {
    label: task.priority,
    badgeClass: 'badge-priority-medium',
  };

  const deadline = formatDeadline(task.dueDate);
  const isOverdue = task.isOverdue;
  const isCompleted = task.status === 'COMPLETED';

  return (
    <article
      className={`task-card ${isOverdue ? 'is-overdue' : ''} ${isCompleted ? 'is-completed' : ''}`}
      id={`task-card-${task.id}`}
    >
      {/* Top Header: Task Type & Priority Badges */}
      <div className="task-card-header">
        <span className={`badge ${typeConfig.badgeClass}`}>{typeConfig.label}</span>
        <span className={`badge ${priorityConfig.badgeClass}`}>{priorityConfig.label}</span>
      </div>

      {/* Body: Title and Description */}
      <div className="task-card-body">
        <h3 className="task-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
          {task.title}
        </h3>

        {task.description && (
          <div className="task-description">
            {expanded || task.description.length <= 140
              ? task.description
              : `${task.description.slice(0, 140)}...`}

            {task.description.length > 140 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  marginLeft: '0.35rem',
                  display: 'inline',
                }}
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Meta: Due Date & Overdue Tag */}
      <div className="task-card-meta">
        <div className={`due-date-indicator ${isOverdue ? 'overdue-alert' : ''}`}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{deadline.formatted}</span>
        </div>

        {deadline.relative && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isOverdue ? 'var(--badge-high-bg)' : 'var(--color-bg-surface)',
              color: isOverdue ? 'var(--badge-high-text)' : 'var(--color-text-secondary)',
              border: `1px solid ${isOverdue ? 'var(--badge-high-border)' : 'var(--color-border)'}`,
            }}
          >
            {deadline.relative}
          </span>
        )}
      </div>

      {/* Footer: Quick Status Switcher & Edit / Delete Buttons */}
      <div className="task-card-footer">
        <div className="status-select-wrap">
          <select
            className={`status-select status-${task.status.toLowerCase()}`}
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            aria-label={`Update status for ${task.title}`}
            id={`task-status-select-${task.id}`}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label={`Edit task ${task.title}`}
            id={`btn-edit-task-${task.id}`}
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            type="button"
            className="icon-btn icon-btn-delete"
            onClick={() => onDelete(task)}
            title="Delete task"
            aria-label={`Delete task ${task.title}`}
            id={`btn-delete-task-${task.id}`}
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
