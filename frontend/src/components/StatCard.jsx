export default function StatCard({ title, count, type, isActive, onClick, icon }) {
  return (
    <div
      className={`stat-card stat-card-${type} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={isActive}
      title={`Click to filter by ${title}`}
    >
      <div className="stat-icon-wrapper">
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-value">{count ?? 0}</span>
        <span className="stat-label">{title}</span>
      </div>
    </div>
  );
}
