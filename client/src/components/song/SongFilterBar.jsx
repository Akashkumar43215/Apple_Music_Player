import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import SearchBox from "./SearchBox";
import { GENRE_CHOICES, MOODS } from "../../utils/constants";

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
  mood,
  onMoodChange,
  genre,
  onGenreChange,
  artist,
  onArtistChange,
  album,
  onAlbumChange,
  artistOptions = [],
  albumOptions = [],
  onClearFilters,
  sort = "newest",
  onSortChange,
}) => {
  const hasActiveFilters = mood || genre || artist || album;

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

        <p className="mt-1 text-sm text-white/50">
          Search songs or filter your library.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        {/* Search */}

        <SearchBox
          value={search}
          onChange={onSearchChange}
          placeholder="Search songs, artists, albums or moods..."
        />

        {/* Mood */}

        <select
          value={mood}
          onChange={(e) => onMoodChange(e.target.value)}
          className={selectClass}
          aria-label="Mood"
        >
          <option value="">All Moods</option>

          {MOODS.filter((m) => m !== "🎼 Other").map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Genre */}

        <select
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          className={selectClass}
          aria-label="Genre"
        >
          <option value="">All Genres</option>

          {GENRE_CHOICES.filter((g) => g !== "🎼 Other").map((g) => (
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

        {/* Sort */}

        <select
          value={sort}
          onChange={(e) => onSortChange?.(e.target.value)}
          aria-label="Sort songs"
          className={selectClass}
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Played</option>
          <option value="title">A – Z</option>
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