import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiPlay,
  FiShuffle,
  FiMusic,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { usePlayer } from "../hooks/usePlayer";
import { playlistService } from "../services/playlistService";
import SongCard from "../components/song/SongCard";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { getMediaUrl } from "../utils/format";

const PlaylistDetails = () => {
  const { id } = useParams();
  const { playSong } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);
  const [selectedSong, setSelectedSong] =
    useState(null);

  const songList = useMemo(
    () => songs.map((item) => item.song),
    [songs]
  );

  const totalDuration = useMemo(() => {
    return songs.reduce(
      (total, item) =>
        total + (item.song.duration || 0),
      0
    );
  }, [songs]);

  const durationText = useMemo(() => {
    const minutes = Math.floor(totalDuration / 60);

    if (minutes < 60) {
      return `${minutes} mins`;
    }

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hrs} hr ${mins} min`;
  }, [totalDuration]);

  const loadPlaylist = useCallback(async () => {
    try {
      setLoading(true);

      const data =
        await playlistService.getPlaylist(id);

      setPlaylist(data.playlist);
      setSongs(data.songs || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not load playlist"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const removeSong = async () => {
    if (!selectedSong) return;

    try {
      await playlistService.removeSong(
        id,
        selectedSong._id
      );

      setSongs((prev) =>
        prev.filter(
          (item) =>
            item.song._id !== selectedSong._id
        )
      );

      toast.success("Song removed");

      setShowDeleteDialog(false);
      setSelectedSong(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not remove song"
      );
    }
  };

  const playAll = () => {
    if (!songList.length) return;

    playSong(songList[0], songList);
  };

  const shufflePlay = () => {
    if (!songList.length) return;

    const shuffled = [...songList];

    for (
      let i = shuffled.length - 1;
      i > 0;
      i--
    ) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    playSong(shuffled[0], shuffled);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-white">
        Loading playlist...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="py-24 text-center text-white">
        Playlist not found
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="
            mb-12
            flex
            flex-col
            gap-8
            lg:flex-row
          "
        >
          <div
            className="
              flex
              h-72
              w-72
              items-center
              justify-center
              overflow-hidden
              rounded-3xl
              bg-gradient-brand
            "
          >
            {playlist.coverUrl ? (
              <img
                src={getMediaUrl(
                  playlist.coverUrl
                )}
                alt={playlist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <FiMusic
                size={90}
                className="text-white/40"
              />
            )}
          </div>

          <div className="flex flex-1 flex-col justify-end">
            <span
              className="
                text-sm
                uppercase
                tracking-[5px]
                text-white/40
              "
            >
              Playlist
            </span>

            <h1 className="mt-3 text-6xl font-black text-white">
              {playlist.name}
            </h1>

            <p className="mt-5 max-w-3xl text-white/60">
              {playlist.description ||
                "No description"}
            </p>

            <div className="mt-5 flex gap-6 text-white/50">
              <span>
                {songs.length}{" "}
                {songs.length === 1
                  ? "Song"
                  : "Songs"}
              </span>

              <span>{durationText}</span>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={playAll}
                disabled={!songList.length}
                className="
                  btn-primary
                  flex
                  items-center
                  gap-2
                  disabled:opacity-50
                "
              >
                <FiPlay />
                Play All
              </button>

              <button
                onClick={shufflePlay}
                disabled={!songList.length}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  px-6
                  py-3
                  text-white
                  transition
                  hover:bg-white/10
                  disabled:opacity-50
                "
              >
                <FiShuffle />
              </button>
            </div>
          </div>
        </motion.div>

                {/* Songs */}

        {songs.length === 0 ? (
          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/5
              py-20
              text-center
            "
          >
            <FiMusic
              size={60}
              className="mx-auto text-white/30"
            />

            <h2 className="mt-6 text-3xl font-bold text-white">
              No Songs Yet
            </h2>

            <p className="mt-2 text-white/40">
              Add songs to this playlist.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
            {songs.map((item) => (
              <div
                key={item._id}
                className="relative group"
              >
                <div
                  onClick={() =>
                    playSong(item.song, songList)
                  }
                  className="cursor-pointer"
                >
                  <SongCard
                    song={item.song}
                    songList={songList}
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSong(item.song);
                    setShowDeleteDialog(true);
                  }}
                  className="
                    absolute
                    right-3
                    top-3
                    rounded-full
                    bg-black/60
                    backdrop-blur-xl
                    p-2
                    text-white
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:opacity-100
                    hover:bg-red-500
                  "
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Remove Song"
        message={`Are you sure you want to remove "${
          selectedSong?.title || ""
        }" from this playlist?`}
        confirmText="Remove"
        confirmVariant="danger"
        onConfirm={removeSong}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedSong(null);
        }}
      />
    </>
  );
};

export default PlaylistDetails;