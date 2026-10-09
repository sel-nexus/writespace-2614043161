import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

beforeEach(() => window.localStorage.clear());

function Destination() {
  const location = useLocation();
  return <p>{location.pathname === '/admin' ? 'Admin reached' : 'Blogs reached'}</p>;
}

function AuthHarness({ path, page }) {
  const location = useLocation();
  return location.pathname === path ? page : <Destination />;
}

function renderAuth(path, page) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthHarness page={page} path={path} />
    </MemoryRouter>,
  );
}

describe('login page', () => {
  it('logs in the default admin and routes to the admin home', async () => {
    const user = userEvent.setup();
    renderAuth('/login', <LoginPage />);
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByText('Admin reached')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_session')).role).toBe('admin');
  });

  it('shows an inline error for invalid credentials', async () => {
    const user = userEvent.setup();
    renderAuth('/login', <LoginPage />);
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'incorrect');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');
  });
});

describe('registration page', () => {
  it('creates a user session and routes to blogs', async () => {
    const user = userEvent.setup();
    renderAuth('/register', <RegisterPage />);
    await user.type(screen.getByLabelText('Display Name'), 'Mira Vale');
    await user.type(screen.getByLabelText('Username'), 'mira');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.type(screen.getByLabelText('Confirm Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(await screen.findByText('Blogs reached')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))[0]).toMatchObject({ username: 'mira', role: 'user' });
  });

  it('rejects mismatched passwords and duplicate usernames', async () => {
    const user = userEvent.setup();
    renderAuth('/register', <RegisterPage />);
    await user.type(screen.getByLabelText('Display Name'), 'Mira Vale');
    await user.type(screen.getByLabelText('Username'), 'mira');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.type(screen.getByLabelText('Confirm Password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.');
    await user.clear(screen.getByLabelText('Confirm Password'));
    await user.type(screen.getByLabelText('Confirm Password'), 'secret');
    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Username'), 'ADMIN');
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('That username is already taken.');
  });
});
