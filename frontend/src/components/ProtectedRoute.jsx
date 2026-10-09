import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import useSession from '../utils/useSession';

/**
 * Require a local session and optionally an admin role before rendering a route.
 * @param {{children: JSX.Element, adminOnly?: boolean}} props Route guard properties.
 * @returns {JSX.Element} Protected content or a role-appropriate redirect.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const session = useSession();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && session.role !== 'admin') return <Navigate to="/blogs" replace />;
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.element.isRequired,
  adminOnly: PropTypes.bool,
};
