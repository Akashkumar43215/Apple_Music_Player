// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { FiHeart } from "react-icons/fi";
// import { favoriteService } from "../services/favoriteService";
// import SongCard from "../components/song/SongCard";
// import SongGridSkeleton from "../components/song/SongGridSkeleton";
// import EmptyState from "../components/common/EmptyState";

// const FavoritesPage = () => {
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const loadFavorites = async () => {
//     try {
//       const data = await favoriteService.getFavorites();
//       setSongs(data.songs || []);
//     } catch {
//       toast.error("Could not load favorites");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadFavorites();
//   }, []);

//   if (loading) {
//     return <SongGridSkeleton />;
//   }

//   if (!songs.length) {
//     return (
//       <EmptyState
//         icon={FiHeart}
//         title="No Favorites Yet"
//         message="Tap the heart icon on any song to add it here."
//       />
//     );
//   }

//   return (
//     <div className="mx-auto max-w-7xl">
//       <h1 className="mb-2 text-4xl font-black text-white">
//         ❤️ Favorites
//       </h1>

//       <p className="mb-8 text-white/50">
//         {songs.length} favorite songs
//       </p>

//       <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
//         {songs.map((song) => (
//           <SongCard
//             key={song._id}
//             song={song}
//             songList={songs}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FavoritesPage;




import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";

import { favoriteService } from "../services/favoriteService";

import SongCard from "../components/song/SongCard";
import SongGridSkeleton from "../components/song/SongGridSkeleton";
import EmptyState from "../components/common/EmptyState";

const FavoritesPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);

    try {
      const data = await favoriteService.getFavorites();
      setSongs(data?.songs ?? []);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      toast.error("Could not load favorites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchFavorites = async () => {
      try {
        const data = await favoriteService.getFavorites();

        if (mounted) {
          setSongs(data?.songs ?? []);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to load favorites:", error);
          toast.error("Could not load favorites");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFavorites();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <SongGridSkeleton />;
  }

  if (songs.length === 0) {
    return (
      <EmptyState
        icon={FiHeart}
        title="No Favorites Yet"
        message="Tap the heart icon on any song to add it here."
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-2 text-4xl font-black text-white">
        ❤️ Favorites
      </h1>

      <p className="mb-8 text-white/50">
        {songs.length} favorite{songs.length !== 1 ? "s" : ""} song
        {songs.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {songs.map((song) => (
          <SongCard
            key={song._id}
            song={song}
            songList={songs}
          />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;