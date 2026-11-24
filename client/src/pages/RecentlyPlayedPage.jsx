import { useEffect, useState } from "react";
import { FiClock, FiPlay } from "react-icons/fi";

import { recentlyPlayedService } from "../services/recentlyPlayedService";
import { usePlayer } from "../hooks/usePlayer";
import { getCoverUrl } from "../utils/format";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

const RecentlyPlayedPage = () => {
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    recentlyPlayedService.getRecentlyPlayed(50).then((d) => setSongs(d.songs)).catch(() => setError(true));
  }, []);

  if (error) return <EmptyState icon={FiClock} title="Couldn't load your history" message="Please check your connection and try again." />;
  if (!songs) return <Spinner />;
  if (songs.length === 0) return <EmptyState icon={FiClock} title="Nothing played yet" message="Songs you play will show up here." />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-4xl font-black text-white">Recently Played</h1>
      <ul className="space-y-1">
        {songs.map((s) => (
          <li key={s._id}>
            <button onClick={() => playSong(s, songs)} className="group flex w-full items-center gap-4 rounded-xl p-2 text-left hover:bg-white/10">
              <img src={getCoverUrl(s.coverUrl, 96)} loading="lazy" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-white/5 object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-white">{s.title}</span>
                <span className="block truncate text-sm text-white/50">{s.artist}</span>
              </span>
              <FiPlay className="shrink-0 text-white/50 group-hover:text-white" aria-hidden="true" />
              <span className="sr-only">Play {s.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentlyPlayedPage;
