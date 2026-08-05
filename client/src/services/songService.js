import api from './api';

/**
 * Wraps the /api/songs endpoints. Upload/update use multipart form-data
 * since they carry files; everything else is plain JSON.
 */
export const songService = {
  getSongs: async (params = {}) => {
    const { data } = await api.get('/songs', { params });
    return data;
  },

  getSongById: async (id) => {
    const { data } = await api.get(`/songs/${id}`);
    return data;
  },

  getFilterOptions: async () => {
    const { data } = await api.get('/songs/meta/filters');
    return data;
  },

  uploadSong: async ({ title, artist, album, genre, audioFile, coverFile }, onProgress) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    if (album) formData.append('album', album);
    if (genre) formData.append('genre', genre);
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);

    const { data } = await api.post('/songs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data;
  },

  updateSong: async (id, { title, artist, album, genre, coverFile }) => {
    const formData = new FormData();
    if (title !== undefined) formData.append('title', title);
    if (artist !== undefined) formData.append('artist', artist);
    if (album !== undefined) formData.append('album', album);
    if (genre !== undefined) formData.append('genre', genre);
    if (coverFile) formData.append('cover', coverFile);

    const { data } = await api.put(`/songs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteSong: async (id) => {
    const { data } = await api.delete(`/songs/${id}`);
    return data;
  },
};
