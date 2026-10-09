import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UserManagement from './UserManagement';

afterEach(() => vi.useRealTimers());

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

  it('creates a user account and persists the complete selected-role record', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('crypto', { randomUUID: () => 'created-id' });
    renderUsers();
    await user.type(screen.getByLabelText('Display Name'), 'Ari North');
    await user.type(screen.getByLabelText('Username'), 'ari');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.selectOptions(screen.getByLabelText('Role'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(screen.getByText('Ari North')).toBeInTheDocument();
    const [createdUser] = JSON.parse(window.localStorage.getItem('writespace_users'));
    expect(createdUser).toEqual({ id: 'created-id', displayName: 'Ari North', username: 'ari', password: 'secret', role: 'admin', createdAt: expect.any(String) });
    expect(new Date(createdUser.createdAt).toISOString()).toBe(createdUser.createdAt);
    vi.unstubAllGlobals();
  });

  it('rejects missing and whitespace-only fields and duplicate usernames', async () => {
    const user = userEvent.setup();
    renderUsers();
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('All fields are required.');
    await user.type(screen.getByLabelText('Display Name'), '   ');
    await user.type(screen.getByLabelText('Username'), 'ari');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(screen.getByRole('alert')).toHaveTextContent('All fields are required.');
    await user.clear(screen.getByLabelText('Display Name'));
    await user.type(screen.getByLabelText('Display Name'), 'Ari North');
    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Username'), '   ');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(screen.getByRole('alert')).toHaveTextContent('All fields are required.');
    await user.clear(screen.getByLabelText('Username'));
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

  it('shows an error and does not add an account when account creation cannot be saved', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('crypto', { randomUUID: () => 'failed-user-id' });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage unavailable'); });
    renderUsers();
    await user.type(screen.getByLabelText('Display Name'), 'Ari North');
    await user.type(screen.getByLabelText('Username'), 'ari');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save this account in your browser.');
    expect(screen.queryByText('Ari North')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('shows an error and preserves an account when deletion cannot be saved', async () => {
    const user = userEvent.setup();
    const account = { id: 'u2', displayName: 'Other Reader', username: 'other', password: 'secret', role: 'user', createdAt: '2025-01-01T00:00:00.000Z' };
    window.localStorage.setItem('writespace_users', JSON.stringify([account]));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage unavailable'); });
    renderUsers();
    await user.click(screen.getByRole('button', { name: 'Delete Other Reader' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete this account from your browser.');
    expect(screen.getByText('Other Reader')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([account]);
  });

  it('disables deletion of the currently signed-in account', () => {
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'admin-id', displayName: 'Admin', username: 'admin-user', password: 'secret', role: 'admin' }]));
    renderUsers();
    expect(screen.getByRole('button', { name: 'Current account cannot be deleted' })).toBeDisabled();
  });
});
