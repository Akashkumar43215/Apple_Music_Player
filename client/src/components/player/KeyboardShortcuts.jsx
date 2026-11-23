import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { usePlayer } from '../../hooks/usePlayer';

const SHORTCUTS = [
  ['Space', 'Play / Pause'],
  ['→ / ←', 'Forward / back 10 seconds'],
  ['Ctrl + → / ←', 'Next / previous song'],
  ['↑ / ↓', 'Volume up / down'],
  ['M', 'Mute / unmute'],
  ['S', 'Toggle shuffle'],
  ['R', 'Cycle repeat'],
  ['?', 'Show this help'],
];

/** Global player shortcuts + the "?" help dialog. Renders nothing until the dialog is opened. */
const KeyboardShortcuts = () => {
  const player = usePlayer();
  const latest = useRef(player);
  useEffect(() => {
    latest.current = player;
  });
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      // Never hijack typing, form controls (sliders use arrows natively), or modified combos.
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.altKey || e.metaKey || (e.ctrlKey && !e.key.startsWith('Arrow'))) return;

      if (e.key === '?') return setHelpOpen((o) => !o);

      const p = latest.current;
      if (!p.currentSong) return;
      // Space on a focused button already activates it; don't toggle twice.
      if (e.key === ' ' && /^(BUTTON|A)$/.test(t.tagName)) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const actions = {
        ' ': () => p.togglePlay(),
        ArrowRight: () => (e.ctrlKey ? p.playNext() : p.seek(Math.min(p.duration, p.currentTime + 10))),
        ArrowLeft: () => (e.ctrlKey ? p.playPrevious() : p.seek(Math.max(0, p.currentTime - 10))),
        ArrowUp: () => p.setVolume(Math.min(1, p.volume + 0.1)),
        ArrowDown: () => p.setVolume(Math.max(0, p.volume - 0.1)),
        m: () => p.toggleMute(),
        s: () => p.toggleShuffle(),
        r: () => p.cycleRepeatMode(),
      };
      if (actions[key]) {
        e.preventDefault();
        actions[key]();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} className="relative z-[70]">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#17171D] p-6 text-white">
          <DialogTitle className="mb-4 text-xl font-bold">Keyboard shortcuts</DialogTitle>
          <dl className="space-y-2 text-sm">
            {SHORTCUTS.map(([keys, what]) => (
              <div key={keys} className="flex items-center justify-between gap-4">
                <dt><kbd className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs">{keys}</kbd></dt>
                <dd className="text-white/70">{what}</dd>
              </div>
            ))}
          </dl>
          <button
            onClick={() => setHelpOpen(false)}
            className="mt-6 w-full rounded-full bg-violet-500 py-2 font-semibold"
          >
            Close
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default KeyboardShortcuts;
