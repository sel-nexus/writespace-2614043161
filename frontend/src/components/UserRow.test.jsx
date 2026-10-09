import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UserRow from './UserRow';

const user = {
  id: 'user-1',
  displayName: 'Reader One',
  username: 'reader',
  role: 'user',
  createdAt: '2024-01-15T12:00:00.000Z',
};

function renderRow(overrides = {}) {
  const onDelete = vi.fn();
  render(
    <table>
      <tbody>
        <UserRow user={user} isDefaultAdmin={false} isCurrentUser={false} onDelete={onDelete} {...overrides} />
      </tbody>
    </table>,
  );
  return onDelete;
}

describe('UserRow deletion controls', () => {
  it('enables deletion for an ordinary account and passes that account to the callback', async () => {
    const onDelete = renderRow();
    const deleteButton = screen.getByRole('button', { name: 'Delete Reader One' });

    expect(deleteButton).toBeEnabled();
    await userEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(user);
  });

  it('disables deletion for the default admin', async () => {
    const onDelete = renderRow({ isDefaultAdmin: true, user: { ...user, role: 'admin' } });
    const deleteButton = screen.getByRole('button', { name: 'Default admin cannot be deleted' });

    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveAttribute('title', 'Default admin cannot be deleted.');
    await userEvent.click(deleteButton);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('disables deletion for the current account', async () => {
    const onDelete = renderRow({ isCurrentUser: true });
    const deleteButton = screen.getByRole('button', { name: 'Current account cannot be deleted' });

    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveAttribute('title', 'You cannot delete your own account.');
    await userEvent.click(deleteButton);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
