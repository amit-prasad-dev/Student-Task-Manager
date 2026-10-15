import { useEffect, useRef } from 'react';

export default function ConfirmModal({ isOpen, task, onCancel, onConfirm, deleting }) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const openerRef = useRef(null);

  // Focus the least destructive action on open and restore focus on close.
  useEffect(() => {
    if (!isOpen) return undefined;

    openerRef.current = document.activeElement;
    cancelButtonRef.current?.focus();

    return () => {
      if (openerRef.current?.isConnected) {
        openerRef.current.focus();
      } else {
        // The delete button is removed with its task, so return to the task list.
        document.getElementById('task-list')?.focus();
      }
      openerRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  function handleDialogKeyDown(e) {
    if (e.key !== 'Tab') return;

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      ) || []
    ).filter((element) => element.getClientRects().length > 0);

    if (focusableElements.length === 0) {
      e.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const focusIsOutsideDialog = !dialogRef.current?.contains(document.activeElement);

    if (e.shiftKey && (document.activeElement === firstElement || focusIsOutsideDialog)) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && (document.activeElement === lastElement || focusIsOutsideDialog)) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  if (!isOpen || !task) return null;

  return (
    <div
      className="modal-overlay"
      onKeyDown={handleDialogKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div ref={dialogRef} className="modal-content modal-content-sm" tabIndex={-1}>
        <div className="modal-header">
          <h2 id="confirm-modal-title" className="modal-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Delete Task
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
            Are you sure you want to delete this study task?
          </p>
          <div
            style={{
              padding: '0.75rem 0.85rem',
              backgroundColor: 'var(--color-bg-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--color-text-primary)',
            }}
          >
            {task.title}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            This will permanently remove the task from your study planner database. This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={deleting}
            id="btn-confirm-delete"
          >
            {deleting ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
