import api from "./api";

export const playlistService = {
  async getPlaylists() {
    const { data } = await api.get("/playlists");
    return data;
  },

  async getPlaylist(id) {
    const { data } = await api.get(`/playlists/${id}`);
    return data;
  },

  async createPlaylist(payload) {
    const { data } = await api.post("/playlists", payload);
    return data;
  },

  async updatePlaylist(id, payload) {
    const { data } = await api.put(`/playlists/${id}`, payload);
    return data;
  },

  async deletePlaylist(id) {
    const { data } = await api.delete(`/playlists/${id}`);
    return data;
  },

  async addSong(id, songId) {
    const { data } = await api.post(`/playlists/${id}/songs`, {
      songId,
    });
    return data;
  },

  async removeSong(id, songId) {
    const { data } = await api.delete(
      `/playlists/${id}/songs/${songId}`
    );
    return data;
  },
};