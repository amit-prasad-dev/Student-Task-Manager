import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import DashboardView from './components/DashboardView.jsx';
import TaskControls from './components/TaskControls.jsx';
import TaskCard from './components/TaskCard.jsx';
import TaskModal from './components/TaskModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import Toast from './components/Toast.jsx';
import { api } from './services/api.js';
import './App.css';

export default function App() {
  // Theme state: defaults to light, reads from localStorage if saved
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('stm_theme') || 'light';
  });

  // Apply theme attribute to root HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Backend data state
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Search & Filter controls state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [taskType, setTaskType] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [overdue, setOverdue] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate,asc');

  // Modal dialog states
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    task: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    task: null,
    deleting: false,
  });

  // Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Synchronize tasks and stats with the backend whenever filters or refreshKey changes
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [taskList, dashboardStats] = await Promise.all([
          api.getTasks({
            search: debouncedSearch,
            status,
            taskType,
            priority,
            overdue,
            sortBy,
          }),
          api.getDashboardStats().catch((err) => {
            console.warn('Dashboard stats check failed:', err);
            return null;
          }),
        ]);

        if (!ignore) {
          setTasks(taskList);
          setBackendOnline(true);
          if (dashboardStats) {
            setStats(dashboardStats);
          }
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load tasks:', err);
          setError(err.message || 'Could not connect to backend server');
          setBackendOnline(false);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, status, taskType, priority, overdue, sortBy, refreshKey]);

  const refreshData = () => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setTaskType('ALL');
    setPriority('ALL');
    setOverdue(false);
    setSortBy('dueDate,asc');
    setLoading(true);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(search.trim()) ||
      status !== 'ALL' ||
      taskType !== 'ALL' ||
      priority !== 'ALL' ||
      overdue === true ||
      sortBy !== 'dueDate,asc'
    );
  }, [search, status, taskType, priority, overdue, sortBy]);

  // Task creation handler
  const handleOpenCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      task: null,
    });
  };

  // Task edit handler
  const handleOpenEditModal = (task) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      task,
    });
  };

  // Save task (create or update)
  const handleSaveTask = async (formData) => {
    if (modalState.mode === 'edit' && modalState.task) {
      await api.updateTask(modalState.task.id, formData);
      addToast('Task updated successfully', 'success');
    } else {
      await api.createTask(formData);
      addToast('Study task created successfully', 'success');
    }
    refreshData();
  };

  // Quick status toggle
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      addToast(`Task marked as ${newStatus.replace('_', ' ')}`, 'success');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Delete flow
  const handleOpenDeleteModal = (task) => {
    setDeleteModalState({
      isOpen: true,
      task,
      deleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.task) return;
    setDeleteModalState((prev) => ({ ...prev, deleting: true }));

    try {
      await api.deleteTask(deleteModalState.task.id);
      addToast('Task deleted successfully', 'success');
      setDeleteModalState({ isOpen: false, task: null, deleting: false });
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to delete task', 'error');
      setDeleteModalState((prev) => ({ ...prev, deleting: false }));
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar
        onOpenCreateModal={handleOpenCreateModal}
        theme={theme}
        onToggleTheme={toggleTheme}
        backendOnline={backendOnline}
      />

      <main className="main-content">
        {/* Dashboard Statistics Overview Bar */}
        <DashboardView
          stats={stats}
          activeStatus={status}
          overdueFilter={overdue}
          onSelectStatus={(newStatus) => {
            setLoading(true);
            setStatus(newStatus);
          }}
          onToggleOverdue={(isOverdue) => {
            setLoading(true);
            setOverdue(isOverdue);
          }}
        />

        {/* Search, Filter, and Sort Controls */}
        <TaskControls
          search={search}
          onSearchChange={(val) => {
            setLoading(true);
            setSearch(val);
          }}
          status={status}
          onStatusChange={(val) => {
            setLoading(true);
            setStatus(val);
          }}
          taskType={taskType}
          onTaskTypeChange={(val) => {
            setLoading(true);
            setTaskType(val);
          }}
          priority={priority}
          onPriorityChange={(val) => {
            setLoading(true);
            setPriority(val);
          }}
          overdue={overdue}
          onOverdueToggle={(val) => {
            setLoading(true);
            setOverdue(val);
          }}
          sortBy={sortBy}
          onSortChange={(val) => {
            setLoading(true);
            setSortBy(val);
          }}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Error Banner with Retry */}
        {error && (
          <div className="error-banner" role="alert">
            <div>
              <strong>Error: </strong>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={refreshData}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Tasks List Section */}
        <section aria-label="Study task list">
          <div className="tasks-section-header">
            <span className="tasks-count-label">
              {loading
                ? 'Loading tasks...'
                : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} found`}
            </span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Fetching your study tasks from backend...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="empty-state-title">
                {hasActiveFilters ? 'No matching tasks found' : 'No study tasks yet'}
              </h2>
              <p className="empty-state-text">
                {hasActiveFilters
                  ? 'Try adjusting your search keywords, clearing status filters, or resetting filters.'
                  : 'Get organized by creating your first academic assignment, coding challenge, or revision task.'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleResetFilters}
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleOpenCreateModal}
                >
                  + Add Your First Task
                </button>
              )}
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create / Edit Modal Dialog */}
      <TaskModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        task={modalState.task}
        onClose={() => setModalState({ isOpen: false, mode: 'create', task: null })}
        onSave={handleSaveTask}
      />

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        task={deleteModalState.task}
        deleting={deleteModalState.deleting}
        onCancel={() => setDeleteModalState({ isOpen: false, task: null, deleting: false })}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
