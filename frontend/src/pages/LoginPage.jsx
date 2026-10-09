import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authenticate, setSession } from '../utils/auth';
import useSession from '../utils/useSession';

/**
 * Render the local demo login form and establish a role-aware browser session.
 * @returns {JSX.Element} Login page.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const existing = useSession();
  if (existing) return <Navigate to={existing.role === 'admin' ? '/admin' : '/blogs'} replace />;
  const submit = (event) => {
    event.preventDefault();
    const session = authenticate(username.trim(), password);
    if (!session) {
      setError('Invalid username or password.');
      return;
    }
    if (!setSession(session)) {
      setError('Unable to save your session in this browser.');
      return;
    }
    navigate(session.role === 'admin' ? '/admin' : '/blogs', { replace: true });
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
        <Link className="text-2xl font-extrabold tracking-tight text-indigo-700" to="/">WriteSpace</Link>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to read and write.</p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <div>
            <label className="mb-2 block font-medium text-slate-700" htmlFor="username">Username</label>
            <input autoComplete="username" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id="username" onChange={(event) => setUsername(event.target.value)} required value={username} />
          </div>
          <div>
            <label className="mb-2 block font-medium text-slate-700" htmlFor="password">Password</label>
            <input autoComplete="current-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </div>
          {error && <p aria-live="assertive" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" type="submit">Login</button>
        </form>
        <p className="mt-6 text-center text-slate-600">New to WriteSpace? <Link className="font-semibold text-indigo-700 hover:underline" to="/register">Register</Link></p>
        <p className="mt-4 text-center text-xs text-slate-500">Demo admin: admin / admin. Do not use real passwords in this local demo.</p>
      </section>
    </main>
  );
}
