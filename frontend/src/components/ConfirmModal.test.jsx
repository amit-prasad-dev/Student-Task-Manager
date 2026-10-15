import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmModal from './ConfirmModal.jsx';

const task = { id: 4, title: 'Review Java collections' };

function ConfirmModalHarness({ onConfirm = vi.fn() }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Open delete dialog</button>
      <ConfirmModal
        isOpen={isOpen}
        task={task}
        deleting={false}
        onCancel={() => setIsOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}

describe('ConfirmModal', () => {
  it('focuses Cancel, traps Tab navigation, and restores focus after Escape', async () => {
    const user = userEvent.setup();
    render(<ConfirmModalHarness />);
    const opener = screen.getByRole('button', { name: 'Open delete dialog' });

    await user.click(opener);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await waitFor(() => expect(cancelButton).toHaveFocus());

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Delete Task' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('calls the existing confirmation action when Delete Task is selected', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmModalHarness onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Open delete dialog' }));
    await user.click(screen.getByRole('button', { name: 'Delete Task' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByText(task.title)).toBeInTheDocument();
  });
});
