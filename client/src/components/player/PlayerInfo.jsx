import { motion } from "framer-motion";
import { FiMusic } from "react-icons/fi";
import { getMediaUrl } from "../../utils/format";

const PlayerInfo = ({ song, isPlaying }) => {
  if (!song) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <FiMusic className="text-2xl text-white/40" />
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Nothing Playing
          </h3>

          <p className="text-sm text-white/40">
            Select a song
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">

      <motion.img
        animate={{
          rotate: isPlaying ? 360 : 0,
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "linear",
        }}
        src={getMediaUrl(song.coverUrl)}
        alt={song.title}
        className="
          h-16
          w-16
          rounded-2xl
          object-cover
          shadow-xl
        "
      />

      <div className="min-w-0">

        <h3
          className="
            truncate
            text-lg
            font-semibold
            text-white
          "
        >
          {song.title}
        </h3>

        <p
          className="
            truncate
            text-sm
            text-white/60
          "
        >
          {song.artist}
        </p>

      </div>

    </div>
  );
};

export default PlayerInfo;