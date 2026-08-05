import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { favoriteService } from "../services/favoriteService";

export const useFavorites = (songId) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songId) return;

    favoriteService
      .checkFavorite(songId)
      .then((fav) => setIsFavorite(fav))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [songId]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(songId);
        setIsFavorite(false);
        toast.success("Removed from Favorites");
      } else {
        await favoriteService.addFavorite(songId);
        setIsFavorite(true);
        toast.success("Added to Favorites ❤️");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return {
    isFavorite,
    loading,
    toggleFavorite,
  };
};