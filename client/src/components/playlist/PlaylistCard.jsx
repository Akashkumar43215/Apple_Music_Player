import { motion } from "framer-motion";
import { FiMusic, FiPlay } from "react-icons/fi";
import { getMediaUrl } from "../../utils/format";

const PlaylistCard = ({
  playlist,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className="
        group
        cursor-pointer
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        transition
        hover:border-violet-400/40
        hover:bg-white/10
      "
    >
      {/* Cover */}

      <div className="relative aspect-square overflow-hidden">

        {playlist.coverUrl ? (
          <img
            src={getMediaUrl(playlist.coverUrl)}
            alt={playlist.name}
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

        <div
          className="
            absolute
            inset-0
            bg-black/30
            opacity-0
            transition
            group-hover:opacity-100
          "
        />

        <div
          className="
            absolute
            bottom-5
            right-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-white
            text-black
            opacity-0
            shadow-xl
            transition-all
            group-hover:opacity-100
          "
        >
          <FiPlay size={22} />
        </div>

      </div>

      {/* Bottom */}

      <div className="p-5">

        <h3 className="truncate text-xl font-bold text-white">
          {playlist.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-white/50">
          {playlist.description || "No description"}
        </p>

      </div>
    </motion.div>
  );
};

export default PlaylistCard;