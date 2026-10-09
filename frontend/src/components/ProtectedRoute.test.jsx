import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { clearSession, setSession } from '../utils/auth';

function LoginPage() {
  const location = useLocation();
  return <p>Login redirect from {location.state?.from}</p>;
}

function renderProtectedRoute({ session, adminOnly = false, initialPath = '/private' } = {}) {
  clearSession();
  if (session) setSession(session);

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/blogs" element={<p>Blogs page</p>} />
        <Route
          path="/private"
          element={(
            <ProtectedRoute adminOnly={adminOnly}>
              <p>Protected content</p>
            </ProtectedRoute>
          )}
        />
      </Routes>
    </MemoryRouter>,
  );
}

const regularUser = { userId: 'user-1', username: 'reader', displayName: 'Reader', role: 'user' };
const adminUser = { userId: 'admin-1', username: 'admin', displayName: 'Admin', role: 'admin' };

describe('ProtectedRoute', () => {
  beforeEach(() => clearSession());

  it('redirects a guest to login and preserves the requested path', () => {
    renderProtectedRoute();
    expect(screen.getByText('Login redirect from /private')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('allows a signed-in user to access a regular protected route', () => {
    renderProtectedRoute({ session: regularUser });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects a regular user away from an admin-only route', () => {
    renderProtectedRoute({ session: regularUser, adminOnly: true });
    expect(screen.getByText('Blogs page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('allows an admin to access an admin-only route', () => {
    renderProtectedRoute({ session: adminUser, adminOnly: true });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
