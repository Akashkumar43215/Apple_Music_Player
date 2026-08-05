import { motion } from "framer-motion";

const SongTitle = ({
  title,
  artist,
  isCurrentSong = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4"
    >
      <h3
        className={`
          truncate
          text-base
          font-bold
          transition-colors
          duration-300
          ${
            isCurrentSong
              ? "text-violet-400"
              : "text-white"
          }
        `}
      >
        {title}
      </h3>

      <p
        className="
          mt-1
          truncate
          text-sm
          text-white/55
        "
      >
        {artist}
      </p>
    </motion.div>
  );
};

export default SongTitle;