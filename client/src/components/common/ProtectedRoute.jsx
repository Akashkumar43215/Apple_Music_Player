import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';
import OfflineScreen from './OfflineScreen';

/**
 * Wraps private routes. Shows a spinner while the initial auth check is
 * in flight (prevents a flash-redirect to /login on page refresh), then
 * either renders the nested route or redirects to /login, preserving the
 * originally requested path so we can send the user back after login.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, offline, refreshUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  if (offline) {
    return <OfflineScreen onRetry={refreshUser} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
