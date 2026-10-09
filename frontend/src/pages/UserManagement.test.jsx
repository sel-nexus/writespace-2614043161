import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UserManagement from './UserManagement';

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'admin-id', username: 'admin', displayName: 'Admin', role: 'admin' }));
});

function renderUsers() {
  return render(<MemoryRouter><UserManagement /></MemoryRouter>);
}

describe('user management', () => {
  it('shows the default admin as permanently protected', () => {
    renderUsers();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Default admin cannot be deleted' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Default admin cannot be deleted' })).toHaveAttribute('title', 'Default admin cannot be deleted.');
  });

  it('creates a user account and persists the selected role', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('crypto', { randomUUID: () => 'created-id' });
    renderUsers();
    await user.type(screen.getByLabelText('Display Name'), 'Ari North');
    await user.type(screen.getByLabelText('Username'), 'ari');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.selectOptions(screen.getByLabelText('Role'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(screen.getByText('Ari North')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))[0]).toMatchObject({ id: 'created-id', username: 'ari', role: 'admin' });
    vi.unstubAllGlobals();
  });

  it('rejects missing fields and duplicate usernames', async () => {
    const user = userEvent.setup();
    renderUsers();
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('All fields are required.');
    await user.type(screen.getByLabelText('Display Name'), 'Ari North');
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(screen.getByRole('alert')).toHaveTextContent('That username is already taken.');
  });

  it('requires confirmation to delete an eligible account and preserves it when declined', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'u2', displayName: 'Other Reader', username: 'other', password: 'secret', role: 'user', createdAt: '2025-01-01T00:00:00.000Z' }]));
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderUsers();
    await user.click(screen.getByRole('button', { name: 'Delete Other Reader' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toHaveLength(1);
    window.confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete Other Reader' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([]);
  });

  it('disables deletion of the currently signed-in account', () => {
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'admin-id', displayName: 'Admin', username: 'admin-user', password: 'secret', role: 'admin' }]));
    renderUsers();
    expect(screen.getByRole('button', { name: 'Delete Admin' })).toBeDisabled();
  });
});
