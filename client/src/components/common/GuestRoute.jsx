import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';

/**
 * Wraps public-only routes like /login and /signup — if the user is already
 * authenticated, bounce them to the home page instead of showing the form.
 */
const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
