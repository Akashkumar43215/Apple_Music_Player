import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiHeart, FiList } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

import { usePlayer } from '../../hooks/usePlayer';
import { useFavorites } from '../../hooks/useFavorites';
import { getMediaUrl } from '../../utils/format';

import PlaybackButtons from './PlaybackButtons';
import ProgressBar from './ProgressBar';
import VolumeSlider from './VolumeSlider';
import SleepTimerMenu from './SleepTimerMenu';
import SimilarSongs from './SimilarSongs';

/** Full-screen now-playing view. z-[55] keeps the queue drawer (z-[60]) above it. */
const ExpandedPlayer = ({ onClose, onShowQueue }) => {
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
  const { isFavorite, toggleFavorite } = useFavorites(currentSong?._id);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!currentSong) return null;
  const cover = getMediaUrl(currentSong.coverUrl);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Now playing"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 240 }}
      className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-[#0a0a0f] text-white"
    >
      {/* Blurred artwork backdrop */}
      {cover && (
        <img
          src={cover}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl"
        />
      )}

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close full player"
            className="rounded-full bg-white/10 p-2"
          >
            <FiChevronDown size={24} />
          </button>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Now Playing</span>
          <span className="w-10" aria-hidden="true" />
        </div>

        <div className="my-6 flex flex-1 items-center justify-center">
          <img
            src={cover}
            alt={`${currentSong.title} cover`}
            className="aspect-square w-full max-w-[22rem] rounded-3xl bg-white/5 object-cover shadow-2xl"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold">{currentSong.title}</h2>
            <p className="truncate text-white/60">{currentSong.artist}</p>
          </div>
          <button
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            className="shrink-0 rounded-full p-3 hover:bg-white/10"
          >
            {isFavorite ? <FaHeart size={22} className="text-pink-500" /> : <FiHeart size={22} />}
          </button>
        </div>

        <div className="mt-6">
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>

        <div className="mt-4 flex justify-center">
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
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={onShowQueue}
            aria-label="Open queue"
            className="rounded-full bg-white/5 p-3 hover:bg-white/10"
          >
            <FiList size={20} />
          </button>
          <div className="hidden sm:block">
            <VolumeSlider volume={volume} muted={isMuted} onVolumeChange={setVolume} onMute={toggleMute} />
          </div>
          <SleepTimerMenu />
        </div>

        <SimilarSongs songId={currentSong._id} />
      </div>
    </motion.div>
  );
};

export default ExpandedPlayer;
