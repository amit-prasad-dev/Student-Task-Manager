import StatCard from './StatCard.jsx';

export default function DashboardView({ stats, activeStatus, overdueFilter, onSelectStatus, onToggleOverdue }) {
  return (
    <section className="dashboard-header" aria-label="Dashboard overview statistics">
      <div className="dashboard-greeting">
        <h1>Study Dashboard</h1>
        <p>Keep track of your coursework, assignments, coding challenges, and exam milestones.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Tasks"
          count={stats.totalTasks}
          type="total"
          isActive={activeStatus === 'ALL' && !overdueFilter}
          onClick={() => {
            onSelectStatus('ALL');
            if (overdueFilter) onToggleOverdue(false);
          }}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />

        <StatCard
          title="Pending"
          count={stats.pendingTasks}
          type="pending"
          isActive={activeStatus === 'PENDING' && !overdueFilter}
          onClick={() => {
            onSelectStatus('PENDING');
            if (overdueFilter) onToggleOverdue(false);
          }}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        <StatCard
          title="In Progress"
          count={stats.inProgressTasks}
          type="in-progress"
          isActive={activeStatus === 'IN_PROGRESS' && !overdueFilter}
          onClick={() => {
            onSelectStatus('IN_PROGRESS');
            if (overdueFilter) onToggleOverdue(false);
          }}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <StatCard
          title="Completed"
          count={stats.completedTasks}
          type="completed"
          isActive={activeStatus === 'COMPLETED' && !overdueFilter}
          onClick={() => {
            onSelectStatus('COMPLETED');
            if (overdueFilter) onToggleOverdue(false);
          }}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Overdue"
          count={stats.overdueTasks}
          type="overdue"
          isActive={overdueFilter}
          onClick={() => onToggleOverdue(!overdueFilter)}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>
    </section>
  );
}
