import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getSession, registerUser, setSession } from '../utils/auth';

/**
 * Render a validated local account registration form.
 * @returns {JSX.Element} Registration page.
 */
export default function RegisterPage() {
  const [fields, setFields] = useState({ displayName: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const existing = getSession();
  if (existing) return <Navigate to={existing.role === 'admin' ? '/admin' : '/blogs'} replace />;
  const update = (event) => setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const result = registerUser(fields);
    if (result.error) {
      setError(result.error);
      return;
    }
    const session = { userId: result.user.id, username: result.user.username, displayName: result.user.displayName, role: result.user.role };
    if (!setSession(session)) {
      setError('Your account was saved, but this browser could not save the session. Please log in.');
      return;
    }
    navigate('/blogs', { replace: true });
  };
  const inputs = [
    { name: 'displayName', label: 'Display Name', type: 'text', autoComplete: 'name' },
    { name: 'username', label: 'Username', type: 'text', autoComplete: 'username' },
    { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', autoComplete: 'new-password' },
  ];
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
        <Link className="text-2xl font-extrabold tracking-tight text-indigo-700" to="/">WriteSpace</Link>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-2 text-slate-600">Start with a fresh page.</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          {inputs.map((input) => (
            <div key={input.name}>
              <label className="mb-2 block font-medium text-slate-700" htmlFor={input.name}>{input.label}</label>
              <input autoComplete={input.autoComplete} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id={input.name} name={input.name} onChange={update} required type={input.type} value={fields[input.name]} />
            </div>
          ))}
          {error && <p aria-live="assertive" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" type="submit">Get Started</button>
        </form>
        <p className="mt-6 text-center text-slate-600">Already have an account? <Link className="font-semibold text-indigo-700 hover:underline" to="/login">Login</Link></p>
        <p className="mt-4 text-center text-xs text-slate-500">Accounts are stored only in this browser. Do not use real passwords.</p>
      </section>
    </main>
  );
}
