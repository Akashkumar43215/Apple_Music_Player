import { useEffect, useState } from 'react';
import { FiMoon } from 'react-icons/fi';
import { usePlayer } from '../../hooks/usePlayer';

const OPTIONS = [
  [15, '15 minutes'],
  [30, '30 minutes'],
  [45, '45 minutes'],
  [60, '60 minutes'],
  ['song', 'End of this song'],
];

const SleepTimerMenu = ({ direction = 'up' }) => {
  const { sleepTimer, setSleepTimer } = usePlayer();
  const [open, setOpen] = useState(false);
  const [, tick] = useState(0);

  // Refresh the "x min left" label while a timed timer runs
  useEffect(() => {
    if (sleepTimer?.type !== 'time') return;
    const id = setInterval(() => tick((n) => n + 1), 15000);
    return () => clearInterval(id);
  }, [sleepTimer]);

  const label =
    sleepTimer?.type === 'time'
      ? `${Math.max(1, Math.ceil((sleepTimer.endsAt - Date.now()) / 60000))} min left`
      : sleepTimer?.type === 'song'
        ? 'After this song'
        : null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Sleep timer"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full p-3 transition ${
          sleepTimer ? 'bg-violet-500 text-white' : 'bg-white/5 hover:bg-white/10'
        }`}
      >
        <FiMoon size={20} />
        {label && <span className="pr-1 text-xs font-medium">{label}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="menu"
            className={`absolute right-0 z-20 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#17171D] py-1 text-sm shadow-2xl ${
              direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {OPTIONS.map(([value, text]) => (
              <li key={text} role="none">
                <button
                  role="menuitem"
                  onClick={() => {
                    setSleepTimer(value);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10"
                >
                  {text}
                </button>
              </li>
            ))}
            {sleepTimer && (
              <li role="none">
                <button
                  role="menuitem"
                  onClick={() => {
                    setSleepTimer(null);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10"
                >
                  Turn off timer
                </button>
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default SleepTimerMenu;
