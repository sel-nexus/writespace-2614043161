import PropTypes from 'prop-types';
import Avatar from './Avatar';

/**
 * Render an account row that stacks into a card on narrow screens.
 * @param {{user: Object, isDefaultAdmin: boolean, isCurrentUser: boolean, onDelete: Function}} props Row properties.
 * @returns {JSX.Element} Responsive account row.
 */
export default function UserRow({ user, isDefaultAdmin, isCurrentUser, onDelete }) {
  const created = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Date unavailable';
  const protectedAccount = isDefaultAdmin || isCurrentUser;
  return (
    <tr className="block border-b border-slate-100 p-4 last:border-0 sm:table-row sm:p-0">
      <td className="block py-2 sm:table-cell sm:px-4 sm:py-4">
        <div className="flex items-center gap-3"><Avatar role={user.role} /><span className="font-semibold text-slate-800">{user.displayName}</span></div>
      </td>
      <td className="block py-1 text-sm text-slate-600 sm:table-cell sm:px-4 sm:py-4">@{user.username}</td>
      <td className="block py-1 sm:table-cell sm:px-4 sm:py-4"><span className={`inline-flex rounded-full px-3 py-0.5 text-sm font-medium ring-1 ${user.role === 'admin' ? 'bg-violet-100 text-violet-700 ring-violet-300' : 'bg-indigo-100 text-indigo-700 ring-indigo-300'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span></td>
      <td className="block py-1 text-sm text-slate-500 sm:table-cell sm:px-4 sm:py-4">{created}</td>
      <td className="block py-2 sm:table-cell sm:px-4 sm:py-4 sm:text-right">
        <button aria-label={isDefaultAdmin ? 'Default admin cannot be deleted' : isCurrentUser ? 'Current account cannot be deleted' : `Delete ${user.displayName}`} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50" disabled={protectedAccount} onClick={() => onDelete(user)} title={isDefaultAdmin ? 'Default admin cannot be deleted.' : isCurrentUser ? 'You cannot delete your own account.' : undefined} type="button">Delete</button>
      </td>
    </tr>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({ id: PropTypes.string.isRequired, displayName: PropTypes.string.isRequired, username: PropTypes.string.isRequired, role: PropTypes.string.isRequired, createdAt: PropTypes.string }).isRequired,
  isDefaultAdmin: PropTypes.bool.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};
