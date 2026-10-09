import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from './Navbar';
import { clearSession, setSession } from '../utils/auth';

function LocationDisplay() {
  const location = useLocation();
  return <output aria-label="Current location">{location.pathname}</output>;
}

function renderNavbar() {
  return render(
    <MemoryRouter initialEntries={['/blogs']}>
      <Navbar />
      <LocationDisplay />
      <Routes>
        <Route path="/" element={<p>Home page</p>} />
        <Route path="/blogs" element={<p>Blogs page</p>} />
        <Route path="/write" element={<p>Write page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    clearSession();
    setSession({ userId: 'user-1', username: 'reader', displayName: 'Reader', role: 'user' });
  });

  it('opens and closes the mobile navigation menu and closes it after choosing a link', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const openButton = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('link', { name: 'All Blogs' }).parentElement).toHaveClass('hidden');

    await user.click(openButton);
    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'All Blogs' }).parentElement).toHaveClass('flex');


    await user.click(screen.getByRole('button', { name: 'Close navigation menu' }));
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    await user.click(screen.getByRole('link', { name: 'Write' }));
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('logs out, clears the session, and navigates home', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: /Reader/ }));
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(screen.getByLabelText('Current location')).toHaveTextContent('/');
    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(window.localStorage.getItem('writespace_session')).toBeNull();
  });

  it('does not show the admin-only Users link to a regular user', () => {
    renderNavbar();
    expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
  });
});
