import api from './api';

export const statsService = {
  // Fire-and-forget from the player; callers must not let a failure interrupt playback.
  recordListen: async (songId, seconds) => {
    const { data } = await api.post('/stats/listen', { songId, seconds });
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/stats', { params: { tz: userTimeZone() } });
    return data;
  },
};

// Days are counted in the viewer's own time zone.
export const userTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};
