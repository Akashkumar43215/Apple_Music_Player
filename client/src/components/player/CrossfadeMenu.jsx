import { useState } from 'react';
import { FiLayers } from 'react-icons/fi';
import { usePlayer } from '../../hooks/usePlayer';
import { CROSSFADE_OPTIONS } from '../../utils/crossfade';

const label = (sec) => (sec === 0 ? 'Off' : `${sec} seconds`);

/** Picks how long the end of one song overlaps the start of the next. Hidden where it cannot work (iOS Safari). */
const CrossfadeMenu = ({ direction = 'up' }) => {
  const { crossfade, setCrossfade, crossfadeSupported } = usePlayer();
  const [open, setOpen] = useState(false);

  if (!crossfadeSupported) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Crossfade: ${label(crossfade)}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-2 rounded-full p-3 transition ${
          crossfade ? 'bg-violet-500 text-white' : 'bg-white/5 hover:bg-white/10'
        }`}
      >
        <FiLayers size={20} aria-hidden="true" />
        {crossfade > 0 && <span className="pr-1 text-xs font-medium">{crossfade}s</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="menu"
            aria-label="Crossfade"
            className={`absolute right-0 z-20 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#17171D] py-1 text-sm shadow-2xl ${
              direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {CROSSFADE_OPTIONS.map((sec) => (
              <li key={sec} role="none">
                <button
                  role="menuitemradio"
                  aria-checked={sec === crossfade}
                  onClick={() => {
                    setCrossfade(sec);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-white/10 ${sec === crossfade ? 'font-semibold text-white' : 'text-white/80'}`}
                >
                  {label(sec)}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CrossfadeMenu;
