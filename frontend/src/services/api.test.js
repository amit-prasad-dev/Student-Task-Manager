import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api.js';

describe('api service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends filters as query parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => [],
    });
    vi.stubGlobal('fetch', fetchMock);

    await api.getTasks({
      search: '  Java exam ',
      status: 'PENDING',
      taskType: 'EXAM',
      priority: 'HIGH',
      overdue: true,
      sortBy: 'dueDate,asc',
    });

    const requestedUrl = new URL(fetchMock.mock.calls[0][0], 'http://localhost');
    expect(requestedUrl.pathname).toBe('/api/v1/tasks');
    expect(requestedUrl.searchParams.get('search')).toBe('Java exam');
    expect(requestedUrl.searchParams.get('status')).toBe('PENDING');
    expect(requestedUrl.searchParams.get('taskType')).toBe('EXAM');
    expect(requestedUrl.searchParams.get('priority')).toBe('HIGH');
    expect(requestedUrl.searchParams.get('overdue')).toBe('true');
  });

  it('converts an optional blank due date to null when creating a task', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ id: 1 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await api.createTask({ title: '  Study Java  ', description: '  ', dueDate: '' });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      title: 'Study Java',
      description: null,
      dueDate: null,
    });
  });

  it('turns structured backend validation errors into useful JavaScript errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 400,
      ok: false,
      headers: { get: () => 'application/json' },
      json: async () => ({
        message: 'Validation failed',
        fieldErrors: [{ field: 'title', message: 'Title is required' }],
      }),
    }));

    await expect(api.createTask({ title: '' })).rejects.toMatchObject({
      message: 'Validation failed',
      status: 400,
      fieldErrors: [{ field: 'title', message: 'Title is required' }],
    });
  });

  it('returns null for a successful no-content delete response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 204, ok: true }));

    await expect(api.deleteTask(7)).resolves.toBeNull();
  });
});
