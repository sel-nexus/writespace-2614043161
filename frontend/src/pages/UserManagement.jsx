import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserRow from '../components/UserRow';
import { ADMIN_ID, getSession } from '../utils/auth';
import { getUsers, saveUsers } from '../utils/storage';

/**
 * Render admin account creation and protected account deletion controls.
 * @returns {JSX.Element} User management page.
 */
export default function UserManagement() {
  const session = getSession();
  const [users, setUsers] = useState(getUsers());
  const [fields, setFields] = useState({ displayName: '', username: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const update = (event) => setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  const createUser = (event) => {
    event.preventDefault();
    const displayName = fields.displayName.trim();
    const username = fields.username.trim();
    if (!displayName || !username || !fields.password || !fields.role) {
      setError('All fields are required.');
      return;
    }
    if (username.toLowerCase() === 'admin' || users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      setError('That username is already taken.');
      return;
    }
    const nextUsers = [...users, { id: crypto.randomUUID(), displayName, username, password: fields.password, role: fields.role, createdAt: new Date().toISOString() }];
    if (!saveUsers(nextUsers)) {
      setError('Unable to save this account in your browser.');
      return;
    }
    setUsers(nextUsers);
    setFields({ displayName: '', username: '', password: '', role: 'user' });
    setError('');
  };
  const deleteUser = (user) => {
    if (user.id === ADMIN_ID || user.id === session?.userId) return;
    if (!window.confirm(`Delete ${user.displayName}'s account? This action cannot be undone.`)) return;
    const nextUsers = users.filter((entry) => entry.id !== user.id);
    if (saveUsers(nextUsers)) setUsers(nextUsers);
    else setError('Unable to delete this account from your browser.');
  };
  const defaultAdmin = { id: ADMIN_ID, displayName: 'Admin', username: 'admin', role: 'admin', createdAt: '' };
  const allUsers = [defaultAdmin, ...users];
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <Link className="font-medium text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500" to="/admin">← Back to Dashboard</Link>
        <div className="mt-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Manage Users</h1>
          <p className="mt-3 text-slate-600">Create accounts and manage the local community.</p>
        </div>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Create User</h2>
          <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" noValidate onSubmit={createUser}>
            <div>
              <label className="mb-2 block font-medium text-slate-700" htmlFor="displayName">Display Name</label>
              <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id="displayName" name="displayName" onChange={update} required value={fields.displayName} />
            </div>
            <div>
              <label className="mb-2 block font-medium text-slate-700" htmlFor="username">Username</label>
              <input autoComplete="off" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id="username" name="username" onChange={update} required value={fields.username} />
            </div>
            <div>
              <label className="mb-2 block font-medium text-slate-700" htmlFor="password">Password</label>
              <input autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id="password" name="password" onChange={update} required type="password" value={fields.password} />
            </div>
            <div>
              <label className="mb-2 block font-medium text-slate-700" htmlFor="role">Role</label>
              <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" id="role" name="role" onChange={update} value={fields.role}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p aria-live="assertive" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2" role="alert">{error}</p>}
            <div className="md:col-span-2"><button className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" type="submit">Create User</button></div>
          </form>
        </section>
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7"><h2 className="text-2xl font-bold text-slate-900">Accounts</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="hidden bg-slate-50 text-sm text-slate-500 sm:table-header-group">
                <tr><th className="px-4 py-3 font-medium" scope="col">Account</th><th className="px-4 py-3 font-medium" scope="col">Username</th><th className="px-4 py-3 font-medium" scope="col">Role</th><th className="px-4 py-3 font-medium" scope="col">Created</th><th className="px-4 py-3 text-right font-medium" scope="col">Actions</th></tr>
              </thead>
              <tbody>
                {allUsers.map((user) => <UserRow isCurrentUser={user.id === session?.userId} isDefaultAdmin={user.id === ADMIN_ID} key={user.id} onDelete={deleteUser} user={user} />)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
