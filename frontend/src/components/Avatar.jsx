import PropTypes from 'prop-types';

/**
 * Return the role-specific avatar mark used throughout WriteSpace.
 * @param {string} role Account role.
 * @returns {JSX.Element} Styled avatar mark.
 */
export function getAvatar(role) {
  const isAdmin = role === 'admin';
  return (
    <span
      aria-label={isAdmin ? 'Admin avatar' : 'User avatar'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-white ${isAdmin ? 'bg-violet-600' : 'bg-indigo-500'}`}
    >
      {isAdmin ? '♛' : '▤'}
    </span>
  );
}

/**
 * Render a role avatar with an optional accessible label.
 * @param {{role: string, className?: string}} props Avatar properties.
 * @returns {JSX.Element} Role avatar.
 */
export default function Avatar({ role, className = '' }) {
  const isAdmin = role === 'admin';
  return (
    <span
      aria-label={isAdmin ? 'Admin avatar' : 'User avatar'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-white ${isAdmin ? 'bg-violet-600' : 'bg-indigo-500'} ${className}`}
    >
      {isAdmin ? '♛' : '▤'}
    </span>
  );
}

Avatar.propTypes = {
  role: PropTypes.string.isRequired,
  className: PropTypes.string,
};
