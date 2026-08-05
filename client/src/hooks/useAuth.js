import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Usage: const { user, login, logout, isAuthenticated } = useAuth();
 * Throws early if used outside AuthProvider — catches setup mistakes fast.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
