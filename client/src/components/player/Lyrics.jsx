import { useEffect, useMemo, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import { songService } from '../../services/songService';
import { usePlayer } from '../../hooks/usePlayer';
import { parseLrc, activeLineIndex } from '../../utils/lrc';

/** Collapsible lyrics for the playing song: synced (highlighted, click to seek) or plain text. Loaded only when opened. */
const Lyrics = ({ songId }) => {
  const { currentTime, seek } = usePlayer();
  const [open, setOpen] = useState(false);
  // Remember which song the answer belongs to, so a slow reply for a previous song is never shown.
  const [result, setResult] = useState({ songId: null, data: null, failed: false });
  const box = useRef(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    if (!open || !songId) return;
    let stale = false;
    songService
      .getLyrics(songId)
      .then((data) => !stale && setResult({ songId, data, failed: false }))
      .catch(() => !stale && setResult({ songId, data: null, failed: true }));
    return () => {
      stale = true;
    };
  }, [open, songId]);

  const current = result.songId === songId ? result : null;
  const data = current?.data;
  const lines = useMemo(() => (data?.synced ? parseLrc(data.synced) : []), [data]);
  const active = activeLineIndex(lines, currentTime);

  // Keep the sung line centred inside the lyrics box (scroll the box, never the whole page)
  useEffect(() => {
    const el = lineRefs.current[active];
    if (!open || !el || !box.current) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    box.current.scrollTo({ top: el.offsetTop - box.current.clientHeight / 2 + el.clientHeight / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, [active, open]);

  let body = null;
  if (open) {
    if (!current) body = <p className="text-sm text-white/60">Loading lyrics…</p>;
    else if (current.failed || data?.unavailable) body = <p className="text-sm text-white/60">Couldn&apos;t load lyrics right now.</p>;
    else if (!data?.found) body = <p className="text-sm text-white/60">No lyrics found for this song.</p>;
    else if (lines.length) {
      body = (
        <ul ref={box} className="relative max-h-64 space-y-1 overflow-y-auto pr-1">
          {lines.map((l, i) => (
            <li key={i}>
              <button
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                onClick={() => seek(l.t)}
                aria-current={i === active ? 'true' : undefined}
                className={`w-full rounded-lg px-2 py-1 text-left text-lg transition-colors ${
                  i === active ? 'font-semibold text-white' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {l.text || '♪'}
              </button>
            </li>
          ))}
        </ul>
      );
    } else {
      body = <p className="max-h-64 overflow-y-auto whitespace-pre-line pr-1 text-base text-white/80">{data.plain}</p>;
    }
  }

  return (
    <section aria-label="Lyrics" className="mt-8">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-sm font-semibold uppercase tracking-widest text-white/60"
      >
        Lyrics
        <FiChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && <div className="mt-3">{body}</div>}
      {open && data?.found && <p className="mt-2 text-xs text-white/50">Lyrics from LRCLIB</p>}
    </section>
  );
};

export default Lyrics;
