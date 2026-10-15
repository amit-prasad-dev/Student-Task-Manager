import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TaskModal from './TaskModal.jsx';

function TaskModalHarness({ onSave }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Open task dialog</button>
      <TaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={onSave}
      />
    </>
  );
}

describe('TaskModal', () => {
  it('shows title validation and does not save an invalid form', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<TaskModalHarness onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Open task dialog' }));
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    expect(screen.getByText('Title is mandatory')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits an empty optional due date as null', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<TaskModalHarness onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Open task dialog' }));
    await user.type(screen.getByLabelText(/Task Title/), 'Study Java');
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Study Java',
      dueDate: null,
    })));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps keyboard focus inside the dialog and restores it after Escape', async () => {
    const user = userEvent.setup();
    render(<TaskModalHarness onSave={vi.fn().mockResolvedValue(undefined)} />);
    const opener = screen.getByRole('button', { name: 'Open task dialog' });

    await user.click(opener);
    const title = screen.getByLabelText(/Task Title/);
    await waitFor(() => expect(title).toHaveFocus());

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Close modal' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Create Task' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close modal' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('shows a backend field validation error without losing the dialog', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue({
      fieldErrors: [{ field: 'title', message: 'Title already exists' }],
    });
    render(<TaskModalHarness onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Open task dialog' }));
    await user.type(screen.getByLabelText(/Task Title/), 'Study Java');
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    expect(await screen.findByText('Title already exists')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
