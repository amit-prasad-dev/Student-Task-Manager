/**
 * Centralized API client for the Student Task Manager backend.
 *
 * Encapsulates all HTTP operations, handles query parameter serialization,
 * sanitizes datetime inputs (converting blank strings to null),
 * and standardizes error responses.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Sanitizes task payload to guarantee Jackson deserialization compatibility.
 * Blank or whitespace date strings MUST be sent as null.
 */
function sanitizeTaskPayload(payload) {
  const sanitized = { ...payload };

  if (sanitized.title) {
    sanitized.title = sanitized.title.trim();
  }
  if (sanitized.description !== undefined && sanitized.description !== null) {
    sanitized.description = sanitized.description.trim() || null;
  }

  // Convert empty string or whitespace date to null
  if (!sanitized.dueDate || (typeof sanitized.dueDate === 'string' && sanitized.dueDate.trim() === '')) {
    sanitized.dueDate = null;
  } else if (typeof sanitized.dueDate === 'string') {
    // If input is YYYY-MM-DDTHH:mm, append seconds if missing to match ISO-8601 LocalDateTime pattern
    const trimmedDate = sanitized.dueDate.trim();
    if (trimmedDate.length === 16) {
      sanitized.dueDate = `${trimmedDate}:00`;
    }
  }

  return sanitized;
}

/**
 * Handles JSON parsing and translates HTTP errors into friendly errors.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // 204 No Content has no body
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = 'Request failed';
      let fieldErrors = [];

      if (isJson && data) {
        if (data.fieldErrors && Array.isArray(data.fieldErrors)) {
          fieldErrors = data.fieldErrors;
          errorMessage = data.message || 'Validation failed for one or more fields';
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.fieldErrors = fieldErrors;
      error.payload = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      const networkError = new Error('Cannot connect to backend server. Make sure Spring Boot is running on port 8080.');
      networkError.status = 0;
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  /**
   * Retrieves tasks with optional search, filters, and custom sorting.
   */
  async getTasks({ search, status, taskType, priority, overdue, sortBy } = {}) {
    const query = new URLSearchParams();

    if (search && search.trim()) {
      query.set('search', search.trim());
    }
    if (status && status !== 'ALL') {
      query.set('status', status);
    }
    if (taskType && taskType !== 'ALL') {
      query.set('taskType', taskType);
    }
    if (priority && priority !== 'ALL') {
      query.set('priority', priority);
    }
    if (overdue === true) {
      query.set('overdue', 'true');
    }
    if (sortBy) {
      query.set('sortBy', sortBy);
    }

    const queryString = query.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, { method: 'GET' });
  },

  /**
   * Fetches a single task by ID.
   */
  async getTaskById(id) {
    return request(`/tasks/${id}`, { method: 'GET' });
  },

  /**
   * Creates a new study task.
   */
  async createTask(taskData) {
    const body = JSON.stringify(sanitizeTaskPayload(taskData));
    return request('/tasks', {
      method: 'POST',
      body,
    });
  },

  /**
   * Updates an existing study task.
   */
  async updateTask(id, taskData) {
    const body = JSON.stringify(sanitizeTaskPayload(taskData));
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body,
    });
  },

  /**
   * Quick status update (PATCH /api/v1/tasks/{id}/status).
   */
  async updateTaskStatus(id, status) {
    const body = JSON.stringify({ status });
    return request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body,
    });
  },

  /**
   * Deletes a study task.
   */
  async deleteTask(id) {
    return request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Fetches dashboard summary counts.
   */
  async getDashboardStats() {
    return request('/dashboard/stats', { method: 'GET' });
  },
};
