import { useEffect, useState } from 'react';
import { FiPlay } from 'react-icons/fi';

import { songService } from '../../services/songService';
import { usePlayer } from '../../hooks/usePlayer';
import { getMediaUrl } from '../../utils/format';

/** "More like this": songs similar to `songId`; clicking one plays it with the list as the queue. */
const SimilarSongs = ({ songId }) => {
  const { playSong } = usePlayer();
  // Keep which song the list belongs to, so a slow answer for a previous song is never shown.
  const [result, setResult] = useState({ songId: null, songs: [] });

  useEffect(() => {
    if (!songId) return;
    let stale = false;
    songService
      .getSimilarSongs(songId, 6)
      .then((data) => !stale && setResult({ songId, songs: data.songs || [] }))
      .catch(() => !stale && setResult({ songId, songs: [] }));
    return () => {
      stale = true;
    };
  }, [songId]);

  const songs = result.songId === songId ? result.songs : [];
  if (songs.length === 0) return null;

  return (
    <section aria-label="More like this" className="mt-8">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">More like this</h3>
      <ul className="space-y-1">
        {songs.map((s) => (
          <li key={s._id}>
            <button
              onClick={() => playSong(s, songs)}
              className="group flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/10"
            >
              <img src={getMediaUrl(s.coverUrl)} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white/5 object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{s.title}</span>
                <span className="block truncate text-xs text-white/50">{s.artist}</span>
              </span>
              <FiPlay className="shrink-0 text-white/40 group-hover:text-white" aria-hidden="true" />
              <span className="sr-only">Play {s.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SimilarSongs;
