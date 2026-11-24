import { FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';
import { usePlayer } from '../../hooks/usePlayer';
import { getCoverUrl } from '../../utils/format';

/** Compact bottom player for small screens. Tapping it opens the expanded player. */
const MiniPlayer = ({ onExpand }) => {
  const { currentSong, isPlaying, currentTime, duration, togglePlay, playNext } = usePlayer();
  if (!currentSong) return null;
  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#121216]/95 shadow-2xl backdrop-blur-xl lg:hidden">
      <div className="h-0.5 bg-white/10" aria-hidden="true">
        <div className="h-full bg-violet-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-3 p-2.5">
        <button
          onClick={onExpand}
          aria-label="Open full player"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <img
            src={getCoverUrl(currentSong.coverUrl, 96)}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl bg-white/5 object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">{currentSong.title}</span>
            <span className="block truncate text-xs text-white/60">{currentSong.artist}</span>
          </span>
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="rounded-full bg-white p-2.5 text-black"
        >
          {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
        </button>
        <button onClick={playNext} aria-label="Next song" className="p-2 text-white/80">
          <FiSkipForward size={20} />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
