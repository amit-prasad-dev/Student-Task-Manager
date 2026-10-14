import { useState, useEffect, useRef } from 'react';

/**
 * Converts backend ISO-8601 timestamp (e.g. "2026-10-18T14:30:00")
 * into local HTML5 input format "YYYY-MM-DDTHH:mm".
 */
function toDatetimeLocal(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function TaskModal({ isOpen, mode = 'create', task = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    taskType: 'ASSIGNMENT',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const titleInputRef = useRef(null);

  // Initialize or reset form state whenever modal opens or active task changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          dueDate: toDatetimeLocal(task.dueDate),
          priority: task.priority || 'MEDIUM',
          status: task.status || 'PENDING',
          taskType: task.taskType || 'ASSIGNMENT',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          priority: 'MEDIUM',
          status: 'PENDING',
          taskType: 'ASSIGNMENT',
        });
      }
      setErrors({});
      setSubmitting(false);

      // Focus the first input field
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, mode, task]);

  // Handle keyboard Escape to dismiss modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function validate() {
    const newErrors = {};

    // Title validation
    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is mandatory';
    } else if (trimmedTitle.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    // Description length validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    // Due Date validation:
    // When creating a new task, @FutureOrPresent is enforced.
    // When editing, past due dates are allowed (to update overdue items).
    if (formData.dueDate && mode === 'create') {
      const selected = new Date(formData.dueDate);
      const now = new Date();
      // Allow a 1-minute buffer for form filling
      if (selected.getTime() < now.getTime() - 60000) {
        newErrors.dueDate = 'Due date must be in the present or future for new tasks';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        // Empty date input string "" is sent as null
        dueDate: formData.dueDate ? formData.dueDate : null,
      });
      onClose();
    } catch (err) {
      if (err.fieldErrors && Array.isArray(err.fieldErrors)) {
        const backendFieldErrors = {};
        err.fieldErrors.forEach((fErr) => {
          backendFieldErrors[fErr.field] = fErr.message;
        });
        setErrors(backendFieldErrors);
      } else {
        setErrors((prev) => ({
          ...prev,
          form: err.message || 'Failed to save task. Please try again.',
        }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-task-title"
    >
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 id="modal-task-title" className="modal-title">
            {mode === 'edit' ? 'Edit Study Task' : 'Create New Study Task'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {errors.form && (
              <div className="error-banner" style={{ margin: 0 }}>
                <span>{errors.form}</span>
              </div>
            )}

            {/* Task Title */}
            <div className="form-group">
              <label htmlFor="task-title" className="form-label">
                <span>Task Title <span style={{ color: '#ef4444' }}>*</span></span>
                <span className="form-label-optional">{formData.title.length}/100</span>
              </label>
              <input
                ref={titleInputRef}
                id="task-title"
                type="text"
                className={`form-input ${errors.title ? 'has-error' : ''}`}
                placeholder="e.g., LeetCode 75: Binary Tree Traversal"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                maxLength={100}
                required
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Description / Study Notes */}
            <div className="form-group">
              <label htmlFor="task-description" className="form-label">
                <span>Description / Notes</span>
                <span className="form-label-optional">{formData.description.length}/1000</span>
              </label>
              <textarea
                id="task-description"
                className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                placeholder="Key concepts to review, problem numbers, or submission links..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
                maxLength={1000}
                rows={3}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Row 2: Due Date & Task Type */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="task-dueDate" className="form-label">
                  <span>Due Date & Time</span>
                  <span className="form-label-optional">Optional</span>
                </label>
                <input
                  id="task-dueDate"
                  type="datetime-local"
                  className={`form-input ${errors.dueDate ? 'has-error' : ''}`}
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    if (errors.dueDate) setErrors({ ...errors, dueDate: null });
                  }}
                />
                {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="task-taskType" className="form-label">
                  <span>Activity Type <span style={{ color: '#ef4444' }}>*</span></span>
                </label>
                <select
                  id="task-taskType"
                  className="form-select"
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                >
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="CODING_PRACTICE">Coding Practice</option>
                  <option value="EXAM">Exam Prep</option>
                  <option value="REVISION">Revision</option>
                </select>
              </div>
            </div>

            {/* Row 3: Priority & Status */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="task-priority" className="form-label">
                  <span>Priority <span style={{ color: '#ef4444' }}>*</span></span>
                </label>
                <select
                  id="task-priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="HIGH">High (Urgent)</option>
                  <option value="MEDIUM">Medium (Standard)</option>
                  <option value="LOW">Low (Flexible)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-status" className="form-label">
                  <span>Status <span style={{ color: '#ef4444' }}>*</span></span>
                </label>
                <select
                  id="task-status"
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              id="btn-save-task"
            >
              {submitting ? 'Saving...' : mode === 'edit' ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
