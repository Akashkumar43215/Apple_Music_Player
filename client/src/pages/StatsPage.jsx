import { useCallback, useEffect, useState } from "react";
import { FiBarChart2 } from "react-icons/fi";

import { statsService } from "../services/statsService";
import { getMediaUrl, formatListening } from "../utils/format";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

const Card = ({ title, children }) => (
  <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">{title}</h2>
    {children}
  </section>
);

const BigNumber = ({ label, seconds }) => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
    <p className="text-sm text-white/50">{label}</p>
    <p className="mt-2 text-4xl font-black text-white">{formatListening(seconds)}</p>
  </div>
);

// Horizontal bars, each scaled against the biggest value
const BarList = ({ rows, emptyText }) => {
  if (rows.length === 0) return <p className="text-sm text-white/40">{emptyText}</p>;
  const max = Math.max(...rows.map((r) => r.seconds));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate text-white">{r.label}</span>
            <span className="shrink-0 text-white/50">{formatListening(r.seconds)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full rounded-full bg-violet-500" style={{ width: `${(r.seconds / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const WeekChart = ({ daily }) => {
  const max = Math.max(1, ...daily.map((d) => d.seconds));
  // Noon avoids the date flipping because of time-zone arithmetic
  const weekday = (date) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" });
  return (
    <div
      role="img"
      aria-label={`Listening per day: ${daily.map((d) => `${weekday(d.date)} ${formatListening(d.seconds)}`).join(", ")}`}
      className="flex h-44 items-end justify-between gap-2"
    >
      {daily.map((d) => (
        <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[11px] text-white/40">{d.seconds ? formatListening(d.seconds) : ""}</span>
          <div
            className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-400"
            style={{ height: `${d.seconds ? Math.max(4, (d.seconds / max) * 100) : 2}%`, opacity: d.seconds ? 1 : 0.25 }}
          />
          <span className="text-xs text-white/50">{weekday(d.date)}</span>
        </div>
      ))}
    </div>
  );
};

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    statsService
      .getStats()
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <EmptyState
        icon={FiBarChart2}
        title="Couldn't load your stats"
        message="Please check your connection and try again."
        actionLabel="Retry"
        onAction={load}
      />
    );
  }
  if (!stats) return <Spinner />;

  if (stats.totalSeconds === 0) {
    return (
      <EmptyState
        icon={FiBarChart2}
        title="No listening yet"
        message="Play a song for a few seconds and your stats will show up here."
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-4xl font-black text-white">📊 Your Stats</h1>
      <p className="mb-8 text-white/50">Based on the time you actually spent listening.</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <BigNumber label="Total listening time" seconds={stats.totalSeconds} />
        <BigNumber label="Last 7 days" seconds={stats.weekSeconds} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Card title="This week">
            <WeekChart daily={stats.daily} />
          </Card>
        </div>

        <Card title="Top artists">
          <BarList
            rows={stats.topArtists.map((a) => ({ label: a.name, seconds: a.seconds }))}
            emptyText="No artist data yet. Many songs list a label (like T-Series) instead of a singer."
          />
        </Card>

        <Card title="Top moods">
          <BarList rows={stats.topGenres.map((g) => ({ label: g.genre, seconds: g.seconds }))} emptyText="Nothing yet." />
        </Card>

        <div className="lg:col-span-2">
          <Card title="Most listened songs">
            <ul className="divide-y divide-white/5">
              {stats.topSongs.map(({ song, seconds, lastPlayed }) => (
                <li key={song._id} className="flex items-center gap-4 py-3">
                  <img src={getMediaUrl(song.coverUrl)} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-white/5 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{song.title}</p>
                    <p className="truncate text-sm text-white/50">{song.artist}</p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p className="text-white">{formatListening(seconds)}</p>
                    <p className="text-white/40">Last played {new Date(lastPlayed).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
