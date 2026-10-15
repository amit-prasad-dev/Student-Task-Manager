import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { api } from './services/api.js';

vi.mock('./services/api.js', () => ({
  api: {
    getTasks: vi.fn(),
    getDashboardStats: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

const studyTask = {
  id: 1,
  title: 'Study Java collections',
  description: 'Review lists and maps',
  dueDate: null,
  priority: 'HIGH',
  status: 'PENDING',
  taskType: 'REVISION',
  isOverdue: false,
  createdAt: '2026-10-01T10:00:00',
  updatedAt: '2026-10-01T10:00:00',
};

const examTask = {
  ...studyTask,
  id: 2,
  title: 'Prepare for database exam',
  status: 'IN_PROGRESS',
  taskType: 'EXAM',
};

const stats = {
  totalTasks: 2,
  pendingTasks: 1,
  inProgressTasks: 1,
  completedTasks: 0,
  overdueTasks: 0,
};

describe('App task list and dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    api.getTasks.mockResolvedValue([studyTask, examTask]);
    api.getDashboardStats.mockResolvedValue(stats);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads task rows and dashboard statistics from the API service', async () => {
    render(<App />);

    expect(await screen.findByText(studyTask.title)).toBeInTheDocument();
    expect(screen.getByText(examTask.title)).toBeInTheDocument();
    expect(api.getDashboardStats).toHaveBeenCalled();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('sends search and status selections back to the API service', async () => {
    const user = userEvent.setup();
    api.getTasks.mockImplementation(({ search = '', status = 'ALL' } = {}) => {
      if (search) return Promise.resolve([examTask]);
      if (status === 'PENDING') return Promise.resolve([studyTask]);
      return Promise.resolve([studyTask, examTask]);
    });
    render(<App />);

    await screen.findByText(studyTask.title);
    await user.type(screen.getByPlaceholderText('Search tasks by title...'), 'database');

    await waitFor(() => {
      expect(api.getTasks).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'database' }));
    }, { timeout: 2000 });
    expect(await screen.findByText(examTask.title)).toBeInTheDocument();
    expect(screen.queryByText(studyTask.title)).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('Search tasks by title...'));
    await user.click(screen.getByRole('tab', { name: 'Pending' }));
    await waitFor(() => {
      expect(api.getTasks).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'PENDING' }));
    });
    expect(await screen.findByText(studyTask.title)).toBeInTheDocument();
  });

  it('shows a backend load error and lets the user retry', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.getTasks
      .mockRejectedValueOnce(new Error('Backend is unavailable'))
      .mockResolvedValueOnce([studyTask]);
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Backend is unavailable');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText(studyTask.title)).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
