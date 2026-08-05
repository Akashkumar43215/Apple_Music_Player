
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiList } from "react-icons/fi";

import { usePlayer } from "../../hooks/usePlayer";

import PlayerInfo from "./PlayerInfo";
import PlaybackButtons from "./PlaybackButtons";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";
import QueueDrawer from "./QueueDrawer";

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);

  if (!currentSong) return null;

  return (
    <>
      <motion.div
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          damping: 24,
          stiffness: 220,
        }}
        className="
          fixed
          bottom-5
          left-1/2
          z-50
          w-[97%]
          max-w-7xl
          -translate-x-1/2
          overflow-hidden
          rounded-[28px]
          border
          border-white/10
          bg-white/5
          backdrop-blur-3xl
          shadow-[0_25px_80px_rgba(0,0,0,.45)]
        "
      >
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        {/* Main Layout */}
        <div className="relative grid grid-cols-1 gap-6 p-6 lg:grid-cols-[320px_1fr_260px] lg:items-center">

          {/* Left */}
          <PlayerInfo
            song={currentSong}
            isPlaying={isPlaying}
          />

          {/* Center */}
          <div className="flex flex-col items-center">

            <PlaybackButtons
              isPlaying={isPlaying}
              onPlayPause={togglePlay}
              onNext={playNext}
              onPrevious={playPrevious}
              shuffle={isShuffled}
              repeat={repeatMode}
              onToggleShuffle={toggleShuffle}
              onToggleRepeat={cycleRepeatMode}
            />

            <div className="mt-5 w-full max-w-xl">
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={seek}
              />
            </div>

          </div>

          {/* Right */}
          <div className="hidden items-center justify-end gap-6 lg:flex">

            <VolumeSlider
              volume={volume}
              muted={isMuted}
              onVolumeChange={setVolume}
              onMute={toggleMute}
            />

            <button
              onClick={() => setShowQueue(true)}
              className="
                rounded-full
                bg-white/5
                p-3
                transition
                hover:bg-white/10
              "
            >
              <FiList size={20} />
            </button>

          </div>

        </div>
      </motion.div>

      <AnimatePresence>
        {showQueue && (
          <QueueDrawer
            onClose={() => setShowQueue(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PlayerBar;