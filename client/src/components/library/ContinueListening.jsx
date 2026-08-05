import { motion } from "framer-motion";
import {
  FiPlay,
  FiHeart,
  FiClock,
  FiDisc,
} from "react-icons/fi";

import {
  GlassCard,
  AlbumArtwork,
  Button,
} from "../ui";

const ContinueListening = ({
  song,
  onPlay,
}) => {
  if (!song) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mb-16"
    >
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-black text-white">
            Continue Listening
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Pick up where you left off.
          </p>

        </div>

      </div>

      <GlassCard
        hover={false}
        className="
          relative
          overflow-hidden
          rounded-[32px]
          p-8
        "
      >
        {/* Background Glow */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-600/15 blur-[120px]" />

          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-[120px]" />

        </div>

        <div className="relative grid items-center gap-10 lg:grid-cols-[280px_1fr]">

          {/* Cover */}

          <AlbumArtwork
            src={song.coverUrl}
            alt={song.title}
            size="lg"
            className="mx-auto"
          />

          {/* Details */}

          <div>

            <span className="text-xs uppercase tracking-[6px] text-white/40">
              NOW PLAYING
            </span>

            <h2 className="mt-3 text-5xl font-black leading-tight text-white">
              {song.title}
            </h2>

            <p className="mt-3 text-xl text-white/60">
              {song.artist}
            </p>

            {/* Info */}

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/50">

              <div className="flex items-center gap-2">

                <FiDisc />

                <span>{song.album || "Single"}</span>

              </div>

              <div className="flex items-center gap-2">

                <FiClock />

                <span>Last Played</span>

              </div>

            </div>

            {/* Progress */}

            <div className="mt-10">

              <div className="h-2 overflow-hidden rounded-full bg-white/10">

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "42%" }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                />

              </div>

              <div className="mt-3 flex justify-between text-xs text-white/40">

                <span>2:15</span>

                <span>5:30</span>

              </div>

            </div>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-4">

              <Button
                onClick={onPlay}
                className="flex items-center gap-2"
              >
                <FiPlay />

                Continue Listening

              </Button>

              <Button
                variant="glass"
                className="flex items-center gap-2"
              >
                <FiHeart />

                Favorite

              </Button>

            </div>

          </div>

        </div>

      </GlassCard>
    </motion.section>
  );
};

export default ContinueListening;