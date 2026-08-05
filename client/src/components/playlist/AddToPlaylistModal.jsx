import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMusic } from "react-icons/fi";
import toast from "react-hot-toast";

import { playlistService } from "../../services/playlistService";

const AddToPlaylistModal = ({
  songId,
  onClose,
}) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data =
          await playlistService.getPlaylists();

        setPlaylists(data.playlists || []);
      } catch {
        toast.error("Could not load playlists");
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  const addSong = async (playlistId) => {
    try {
      setAdding(playlistId);

      await playlistService.addSong(
        playlistId,
        songId
      );

      toast.success(
        "Song added to playlist"
      );

      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not add song"
      );
    } finally {
      setAdding(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/70
          backdrop-blur-md
          p-4
        "
      >
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 20,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
          className="
            w-full
            max-w-lg
            rounded-3xl
            border
            border-white/10
            bg-[#18181c]
            p-8
            shadow-2xl
          "
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-black text-white">
              Add to Playlist
            </h2>

            <button
              onClick={onClose}
              className="
                rounded-full
                bg-white/10
                p-3
                transition
                hover:bg-white/20
              "
            >
              <FiX />
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-white/60">
              Loading playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div className="py-10 text-center">
              <FiMusic
                size={50}
                className="mx-auto text-white/30"
              />

              <p className="mt-4 text-white/50">
                No playlists found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <button
                  key={playlist._id}
                  onClick={() =>
                    addSong(playlist._id)
                  }
                  disabled={
                    adding === playlist._id
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    px-5
                    py-4
                    text-left
                    transition
                    hover:bg-white/10
                  "
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {playlist.name}
                    </h3>

                    <p className="text-sm text-white/40">
                      {playlist.description ||
                        "No description"}
                    </p>
                  </div>

                  {adding === playlist._id
                    ? "Adding..."
                    : "+"}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddToPlaylistModal;