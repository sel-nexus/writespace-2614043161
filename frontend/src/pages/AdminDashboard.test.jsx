import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'writespace-default-admin', username: 'admin', displayName: 'Admin', role: 'admin' }));
});

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<AdminDashboard />} path="/admin" />
        <Route element={<p>Admin destination</p>} path="*" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('admin dashboard', () => {
  it('shows the four source-listed statistics and empty recent-post state', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Welcome, Admin' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Dashboard statistics' })).toHaveTextContent('Total Posts');
    expect(screen.getByRole('region', { name: 'Dashboard statistics' })).toHaveTextContent('Total Users');
    expect(screen.getByRole('region', { name: 'Dashboard statistics' })).toHaveTextContent('Total Admins');
    expect(screen.getByRole('region', { name: 'Dashboard statistics' })).toHaveTextContent('Total users');
    expect(screen.getByText('No posts yet. Create the first one.')).toBeInTheDocument();
  });

  it('shows recent posts and deletes a post only after confirmation', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'p1', title: 'Recent note', content: 'Body', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Reader' }]));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderDashboard();
    expect(screen.getByRole('link', { name: /Recent note/ })).toHaveAttribute('href', '/blog/p1');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('No posts yet. Create the first one.')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([]);
  });

  it('keeps a post when deletion confirmation is declined', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'p1', title: 'Keep note', content: 'Body', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Reader' }]));
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderDashboard();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toHaveLength(1);
  });
});
