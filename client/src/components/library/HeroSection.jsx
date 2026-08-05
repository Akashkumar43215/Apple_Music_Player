import { motion } from "framer-motion";
import { FiPlay, FiUpload } from "react-icons/fi";
import { Button, GlassCard, AlbumArtwork } from "../ui";
import LibraryStats from "./LibraryStats";

const HeroSection = ({ user, song, totalSongs = 0, onUpload, onPlay }) => {
  // Don't render until we have at least one song
  if (!song) return null;

  return (
    <GlassCard
      hover={false}
      className="relative mb-12 overflow-hidden rounded-[32px] p-8 lg:p-12"
    >
      {/* Background Glow */}
      <div className="absolute -left-28 bottom-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-500/20 blur-[140px]" />

      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[5px] text-white/40">
            Good Evening 👋
          </span>

          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
            Welcome Back,
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {user?.name || "Music Lover"}
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-white/60">
            Continue your music journey, discover new tracks, and enjoy your
            personal collection with a premium listening experience.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Button onClick={onPlay} className="flex items-center gap-2">
              <FiPlay />
              Continue Listening
            </Button>

            <Button
              variant="glass"
              onClick={onUpload}
              className="flex items-center gap-2"
            >
              <FiUpload />
              Upload Music
            </Button>
          </div>

          {/* Stats */}

          {/* <div className="mt-12 flex flex-wrap gap-10">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {totalSongs}
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Songs
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white">
                --
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Genres
              </p>
            </div>
          </div> */}
          <LibraryStats
            totalSongs={totalSongs}
            totalGenres={18}
            totalFavorites={0}
            recentlyPlayed={10}
          />
          
        </motion.div>

        {/* Album Artwork */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex justify-center"
        >
          <AlbumArtwork src={song.coverUrl} alt={song.title} size="xl" />
        </motion.div>
      </div>
    </GlassCard>
  );
};

export default HeroSection;
