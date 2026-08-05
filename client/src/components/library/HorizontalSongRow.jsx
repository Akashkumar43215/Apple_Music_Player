import { useRef } from "react";
import { motion } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import SongCard from "../song/SongCard";

const HorizontalSongRow = ({
  title,
  songs = [],
  onEdit,
  onDelete,
}) => {
  const rowRef = useRef(null);

  if (!songs.length) return null;

  const scroll = (direction) => {
    if (!rowRef.current) return;

    rowRef.current.scrollBy({
      left: direction === "left" ? -700 : 700,
      behavior: "smooth",
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-14"
    >
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-black text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Discover hand-picked songs
          </p>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => scroll("left")}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
              transition
              hover:bg-white/10
            "
          >
            <FiChevronLeft size={18} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
              transition
              hover:bg-white/10
            "
          >
            <FiChevronRight size={18} />
          </button>

        </div>

      </div>

      {/* Songs */}

      <div
        ref={rowRef}
        className="
          flex
          gap-6
          overflow-x-auto
          scroll-smooth
          pb-3
          scrollbar-hide
        "
      >
        {songs.map((song, index) => (
          <motion.div
            key={song._id}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.04,
            }}
            className="
              min-w-[215px]
              max-w-[215px]
              flex-shrink-0
            "
          >
            <SongCard
              song={song}
              songList={songs}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default HorizontalSongRow;