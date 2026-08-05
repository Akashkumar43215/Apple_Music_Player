import api from './api';

export const recentlyPlayedService = {
  getRecentlyPlayed: async (limit = 20) => {
    const { data } = await api.get('/recently-played', { params: { limit } });
    return data;
  },

  recordPlay: async (songId) => {
    // Fire-and-forget from the player — failures shouldn't interrupt playback
    const { data } = await api.post(`/recently-played/${songId}`);
    return data;
  },

  clearRecentlyPlayed: async () => {
    const { data } = await api.delete('/recently-played');
    return data;
  },
};
