import { useEffect, useState } from 'react';
import { FiWifiOff, FiPlay, FiPause } from 'react-icons/fi';
import { usePlayer } from '../../hooks/usePlayer';
import { listSavedSongs } from '../../utils/offlineSongs';

/** Shown instead of the app when it is opened without a network connection while signed in. */
const OfflineScreen = ({ onRetry }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const [songs, setSongs] = useState([]);
  useEffect(() => {
    listSavedSongs().then(setSongs).catch(() => {});
  }, []);

  const play = (song) => (currentSong?._id === song._id ? togglePlay() : playSong(song, songs));

  return (
    <div role="alert" className="flex min-h-screen flex-col items-center gap-4 bg-[#0f0d13] px-6 py-16 text-center text-white">
      <FiWifiOff size={48} aria-hidden="true" className="text-white/60" />
      <h1 className="text-2xl font-bold">You're offline</h1>
      <p className="max-w-sm text-white/60">
        You're still signed in, and this page will continue by itself once you're back online.
        {songs.length === 0 && ' Songs you save for offline (the download button in the player) will appear here.'}
      </p>
      <button onClick={onRetry} className="rounded-full bg-violet-500 px-6 py-2 font-semibold text-white">
        Try again
      </button>

      {songs.length > 0 && (
        <section aria-label="Saved songs" className="mt-6 w-full max-w-md text-left">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">Saved on this device</h2>
          <ul className="divide-y divide-white/10 rounded-2xl bg-white/5">
            {songs.map((s) => {
              const playing = currentSong?._id === s._id && isPlaying;
              return (
                <li key={s._id}>
                  <button onClick={() => play(s)} aria-label={`${playing ? 'Pause' : 'Play'} ${s.title}`} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/10">
                    {playing ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{s.title}</span>
                      <span className="block truncate text-sm text-white/50">{s.artist}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default OfflineScreen;
