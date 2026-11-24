import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiDisc, FiUsers } from "react-icons/fi";

import { songService } from "../services/songService";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

const COPY = {
  artist: { title: "Artists", icon: FiUsers, param: "artist", empty: "No artists yet. Many songs list a label (like T-Series) instead of a singer." },
  album: { title: "Albums", icon: FiDisc, param: "album", empty: "No albums yet. Songs without an album are grouped as singles." },
};

/** Artists / Albums: each name opens the library filtered to it. */
const BrowsePage = ({ kind }) => {
  const { title, icon: Icon, param, empty } = COPY[kind];
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setItems(null);
    setError(false);
    songService.getBrowseList(kind).then(setItems).catch(() => setError(true));
  }, [kind]);

  if (error) return <EmptyState icon={Icon} title={`Couldn't load ${title.toLowerCase()}`} message="Please check your connection and try again." />;
  if (!items) return <Spinner />;
  if (items.length === 0) return <EmptyState icon={Icon} title={`No ${title.toLowerCase()} yet`} message={empty} />;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-8 text-4xl font-black text-white">{title}</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ name, count }) => (
          <li key={name}>
            <Link
              to={`/?${param}=${encodeURIComponent(name)}`}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/10"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white">
                <Icon aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-white">{name}</span>
                <span className="block text-sm text-white/50">{count} {count === 1 ? "song" : "songs"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrowsePage;
