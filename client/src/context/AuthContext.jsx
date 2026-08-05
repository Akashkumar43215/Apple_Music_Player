import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

/**
 * Wraps the app and provides: current user, loading state, and
 * signup/login/logout/refreshUser actions. Persists the session via a JWT
 * in localStorage; on mount it validates that token against GET /auth/me
 * rather than trusting a possibly-stale cached user object.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until initial auth check resolves

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { user: freshUser } = await authService.getMe();
      setUser(freshUser);
    } catch {
      // Token invalid/expired — api.js interceptor already clears storage on 401
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signup = async (name, email, password) => {
    const { token, user: newUser } = await authService.signup(name, email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    toast.success(`Welcome, ${newUser.name}!`);
    return newUser;
  };

  const login = async (email, password) => {
    const { token, user: loggedInUser } = await authService.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    toast.success(`Welcome back, ${loggedInUser.name}!`);
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the network call fails, clear the local session
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out');
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signup,
    login,
    logout,
    updateUser,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
