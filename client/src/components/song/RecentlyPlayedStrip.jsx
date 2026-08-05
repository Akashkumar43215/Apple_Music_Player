import { FiPlay, FiPause, FiMusic } from 'react-icons/fi';
import { getMediaUrl } from '../../utils/format';
import { usePlayer } from '../../hooks/usePlayer';

/**
 * Compact horizontal row of recently played tracks, shown above the main
 * grid on the library page. Clicking a tile plays it with the recently-
 * played list itself as the queue.
 */
const RecentlyPlayedStrip = ({ songs }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  if (!songs || songs.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/40">Recently Played</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {songs.map((song) => {
          const isCurrentSong = currentSong?._id === song._id;
          const coverUrl = getMediaUrl(song.coverUrl);
          return (
            <button
              key={song._id}
              onClick={() => (isCurrentSong ? togglePlay() : playSong(song, songs))}
              className={`group flex w-32 shrink-0 flex-col items-start rounded-lg p-2 text-left transition-colors ${
                isCurrentSong ? 'bg-accent/10 ring-1 ring-accent/40' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-background-tertiary">
                {coverUrl ? (
                  <img src={coverUrl} alt={song.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-brand/20">
                    <FiMusic className="h-6 w-6 text-white/30" />
                  </div>
                )}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                    isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isCurrentSong && isPlaying ? (
                    <FiPause className="h-5 w-5 text-white" />
                  ) : (
                    <FiPlay className="ml-0.5 h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <p className="mt-2 w-full truncate text-xs font-medium text-white">{song.title}</p>
              <p className="w-full truncate text-[11px] text-white/40">{song.artist}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyPlayedStrip;
