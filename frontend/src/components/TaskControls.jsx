export default function TaskControls({
  search,
  onSearchChange,
  status,
  onStatusChange,
  taskType,
  onTaskTypeChange,
  priority,
  onPriorityChange,
  overdue,
  onOverdueToggle,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}) {
  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  return (
    <div className="controls-container" aria-label="Task search, filters and sorting controls">
      {/* Top Row: Search + Select Dropdowns */}
      <div className="controls-row-top">
        <div className="search-input-wrapper">
          <svg className="search-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            id="input-search-tasks"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-select-group">
          {/* Task Type Filter */}
          <select
            className="select-control"
            value={taskType}
            onChange={(e) => onTaskTypeChange(e.target.value)}
            aria-label="Filter by task activity type"
            id="select-task-type"
          >
            <option value="ALL">All Types</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="CODING_PRACTICE">Coding Practice</option>
            <option value="EXAM">Exams</option>
            <option value="REVISION">Revision</option>
          </select>

          {/* Priority Filter */}
          <select
            className="select-control"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            aria-label="Filter by priority urgency"
            id="select-priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            className="select-control"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort tasks by"
            id="select-sort-by"
          >
            <option value="dueDate,asc">Nearest Deadline (Default)</option>
            <option value="dueDate,desc">Furthest Deadline</option>
            <option value="priority,desc">Priority (High → Low)</option>
            <option value="priority,asc">Priority (Low → High)</option>
            <option value="createdAt,desc">Newest Created</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Status Pills & Overdue Toggle */}
      <div className="controls-row-bottom">
        <div className="status-pills" role="tablist" aria-label="Filter tasks by status">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`status-pill ${status === opt.value ? 'active' : ''}`}
              onClick={() => onStatusChange(opt.value)}
              role="tab"
              aria-selected={status === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className={`filter-toggle-overdue ${overdue ? 'active' : ''}`}
            onClick={() => onOverdueToggle(!overdue)}
            aria-pressed={overdue}
            id="btn-filter-overdue"
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: overdue ? '#ef4444' : '#94a3b8',
                display: 'inline-block',
              }}
            />
            <span>Overdue Only</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={onResetFilters}
              title="Reset all search and filters"
            >
              ✕ Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
