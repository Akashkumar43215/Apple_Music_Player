import api from './api';

/**
 * Thin wrappers around the auth endpoints. Components/context call these
 * instead of touching axios directly, so the endpoint paths only live here.
 */
export const authService = {
  signup: async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  updateProfile: async (updates) => {
    const { data } = await api.put('/auth/me', updates);
    return data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
};
