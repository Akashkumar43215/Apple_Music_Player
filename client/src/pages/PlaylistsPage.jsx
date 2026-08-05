import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiMusic } from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PlaylistCard from "../components/playlist/PlaylistCard";
import CreatePlaylistModal from "../components/playlist/CreatePlaylistModal";
import { playlistService } from "../services/playlistService";

const PlaylistsPage = () => {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadPlaylists = async () => {
    try {
      setLoading(true);

      const data = await playlistService.getPlaylists();

      setPlaylists(data.playlists || []);
    } catch {
      toast.error("Could not load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">

      {/* Header */}

      <div className="mb-10 flex items-center justify-between">

        <div>

          <h1 className="text-5xl font-black text-white">
            Playlists
          </h1>

          <p className="mt-2 text-white/50">
            {playlists.length} playlists
          </p>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            btn-primary
            flex
            items-center
            gap-2
          "
        >
          <FiPlus />

          New Playlist

        </button>

      </div>

      {/* Empty */}

      {!loading && playlists.length === 0 && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="
            flex
            flex-col
            items-center
            justify-center
            rounded-3xl
            border
            border-white/10
            bg-white/5
            py-24
          "
        >
          <FiMusic
            size={60}
            className="text-white/30"
          />

          <h2 className="mt-6 text-3xl font-bold">
            No Playlists
          </h2>

          <p className="mt-2 text-white/40">
            Create your first playlist.
          </p>
        </motion.div>
      )}

      {/* Grid */}

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5">

        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist._id}
            playlist={playlist}
            onClick={() =>
              navigate(`/playlists/${playlist._id}`)
            }
          />
        ))}

      </div>

      {showModal && (
        <CreatePlaylistModal
          onClose={() =>
            setShowModal(false)
          }
          onCreated={loadPlaylists}
        />
      )}

    </div>
  );
};

export default PlaylistsPage;