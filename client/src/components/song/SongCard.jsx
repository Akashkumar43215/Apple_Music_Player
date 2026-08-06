
import { motion } from "framer-motion";
import { FiPlay, FiPause, FiMusic } from "react-icons/fi";

import FavoriteButton from "./FavoriteButton";
import SongTitle from "./SongTitle";
import SongDuration from "./SongDuration";
import SongMenu from "./SongMenu";

import { getMediaUrl } from "../../utils/format";
import { useAuth } from "../../hooks/useAuth";
import { usePlayer } from "../../hooks/usePlayer";

const SongCard = ({ song, songList, onEdit, onDelete }) => {
  const { user } = useAuth();

  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  const isCurrentSong = currentSong?._id === song._id;

  const isOwner = user && song.uploadedBy?._id === user._id;
  
  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, songList ?? [song]);
    }
  };

  console.log("Cover URL:", song.coverUrl);
  console.log("Media URL:", getMediaUrl(song.coverUrl));

  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="
        group
        overflow-hidden
        rounded-[26px]
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-violet-400/40
        hover:bg-white/10
        hover:shadow-2xl
      "
    >
      {/* Album Artwork */}
      <div className="relative aspect-square overflow-hidden">
        <FavoriteButton songId={song._id} />

        {song.coverUrl ? (
          <img
            src={getMediaUrl(song.coverUrl)}
            alt={`${song.title} album cover`}
            loading="lazy"
            draggable={false}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-110
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-brand
            "
          >
            <FiMusic
              className="
                text-6xl
                text-white/40
              "
            />
          </div>
        )}

        {/* Dark Overlay */}
        <div
          className="
            absolute
            inset-0
            bg-black/20
            opacity-0
            transition
            duration-300
            group-hover:opacity-100
          "
        />

        {/* Play Button */}
        <button
          type="button"
          onClick={handlePlay}
          aria-label={isCurrentSong && isPlaying ? "Pause song" : "Play song"}
          className="
            absolute
            left-1/2
            top-1/2
            flex
            h-14
            w-14
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white
            text-black
            opacity-0
            shadow-xl
            transition-all
            duration-300
            group-hover:opacity-100
          "
        >
          {isCurrentSong && isPlaying ? (
            <FiPause size={22} />
          ) : (
            <FiPlay size={22} className="ml-1" />
          )}
        </button>

        {/* Owner Menu */}
        {/* {isOwner && (
          <SongMenu
            song={song}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )} */}

        <SongMenu
          song={song}
          isOwner={isOwner}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Bottom Content */}
      <div className="p-5">
        <SongTitle
          title={song.title}
          artist={song.artist}
          isCurrentSong={isCurrentSong}
        />

        <SongDuration duration={song.duration} />
      </div>
    </motion.div>
  );
};

export default SongCard;
