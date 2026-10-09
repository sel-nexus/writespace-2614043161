import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { clearSession } from '../utils/auth';
import useSession from '../utils/useSession';

/**
 * Render role-aware authenticated navigation with a stateful mobile menu and logout.
 * @returns {JSX.Element} Authenticated navigation bar.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const session = useSession();
  const links = [
    { to: '/blogs', label: 'All Blogs' },
    { to: '/write', label: 'Write' },
    ...(session?.role === 'admin' ? [{ to: '/users', label: 'Users' }] : []),
  ];
  const logout = () => {
    clearSession();
    navigate('/', { replace: true });
  };
  const linkClass = ({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-700'}`;
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="text-xl font-extrabold tracking-tight text-indigo-700" to="/">WriteSpace</Link>
        <button aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} className="rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden" onClick={() => setMenuOpen((open) => !open)} type="button">
          <span aria-hidden="true" className="text-xl">{menuOpen ? '×' : '☰'}</span>
        </button>
        <div className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-16 flex-col gap-2 border-b border-slate-100 bg-white p-4 shadow-sm md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          {links.map((link) => <NavLink className={linkClass} key={link.to} onClick={() => setMenuOpen(false)} to={link.to}>{link.label}</NavLink>)}
          <div className="relative flex items-center gap-2 border-t border-slate-100 pt-3 md:border-0 md:pt-0">
            <Avatar role={session?.role || 'user'} />
            <button aria-label={session?.displayName || 'Account'} aria-expanded={accountOpen} className="rounded-lg px-2 py-2 text-left font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={() => setAccountOpen((open) => !open)} type="button">
              {session?.displayName || 'Account'} <span aria-hidden="true">⌄</span>
            </button>
            {accountOpen && <button className="rounded-lg px-3 py-2 text-left font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 md:absolute md:right-0 md:top-12 md:bg-white md:shadow-lg" onClick={logout} type="button">Logout</button>}
          </div>
        </div>
      </nav>
    </header>
  );
}
