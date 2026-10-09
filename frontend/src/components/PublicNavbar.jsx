import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getSession } from '../utils/auth';
import Avatar from './Avatar';

/**
 * Render the public header with guest calls to action or a signed-in dashboard link.
 * @returns {JSX.Element} Public navigation bar.
 */
export default function PublicNavbar() {
  const session = getSession();
  const homePath = session?.role === 'admin' ? '/admin' : '/blogs';
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="text-xl font-extrabold tracking-tight text-indigo-700" to="/">WriteSpace</Link>
        {session ? (
          <div className="flex items-center gap-3">
            <Avatar role={session.role} />
            <span className="hidden font-medium text-slate-700 sm:inline">{session.displayName}</span>
            <Link className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to={homePath}>Go to Dashboard</Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" to="/login">Login</Link>
            <Link className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" to="/register">Get Started</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

PublicNavbar.propTypes = {};
