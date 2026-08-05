import api from "./api";

export const favoriteService = {
  // Get all favorite songs
  async getFavorites() {
    const { data } = await api.get("/favorites");
    return data;
  },

  // Add favorite
  async addFavorite(songId) {
    const { data } = await api.post(`/favorites/${songId}`);
    return data;
  },

  // Remove favorite
  async removeFavorite(songId) {
    const { data } = await api.delete(`/favorites/${songId}`);
    return data;
  },

  // Check favorite status
  async checkFavorite(songId) {
    const { data } = await api.get(`/favorites/check/${songId}`);
    return data.favorite;
  },
};