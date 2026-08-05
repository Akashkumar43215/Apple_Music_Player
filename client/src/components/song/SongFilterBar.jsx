import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import { GENRES } from "../../utils/constants";

const inputClass = `
w-full
rounded-2xl
border
border-white/10
bg-white/5
px-5
py-3
text-white
backdrop-blur-xl
outline-none
transition-all
duration-300
placeholder:text-white/40
focus:border-violet-500
focus:bg-white/[0.08]
`;

const selectClass = `
w-full
rounded-2xl
border
border-white/10
bg-[#17171f]
px-5
py-3
text-white
outline-none
transition-all
duration-300
focus:border-violet-500
`;

const SongFilterBar = ({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  artist,
  onArtistChange,
  album,
  onAlbumChange,
  artistOptions = [],
  albumOptions = [],
  onClearFilters,
}) => {
  const hasActiveFilters = genre || artist || album;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        mb-10
        rounded-[30px]
        border
        border-white/10
        bg-white/[0.03]
        p-6
        backdrop-blur-3xl
      "
    >
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">
          Find Your Music
        </h2>

        <p className="mt-1 text-sm text-white/40">
          Search songs or filter your library.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        {/* Search */}

        <div className="relative">
          <FiSearch
            className="
              absolute
              left-5
              top-1/2
              -translate-y-1/2
              text-white/40
            "
            size={18}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search songs, artists or albums..."
            className={`${inputClass} pl-14`}
          />
        </div>

        {/* Genre */}

        <select
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Genres</option>

          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Artist */}

        <select
          value={artist}
          onChange={(e) => onArtistChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Artists</option>

          {artistOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Album */}

        <select
          value={album}
          onChange={(e) => onAlbumChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Albums</option>

          {albumOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Clear */}

        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-red-400/20
              bg-red-500/10
              px-5
              py-3
              text-red-300
              transition
              hover:bg-red-500/20
            "
          >
            <FiX />
            Clear
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default SongFilterBar;