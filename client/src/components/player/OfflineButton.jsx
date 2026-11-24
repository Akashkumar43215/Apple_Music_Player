import { FiDownload, FiCheck } from 'react-icons/fi';
import { useOfflineSong } from '../../hooks/useOfflineSong';

/** Saves the current song on this device (about 6 MB) so it plays without internet. */
const OfflineButton = ({ song }) => {
  const { saved, busy, toggle } = useOfflineSong(song);
  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from offline songs' : 'Save for offline'}
      className={`rounded-full p-3 transition ${saved ? 'bg-violet-500 text-white' : 'bg-white/5 hover:bg-white/10'} ${busy ? 'animate-pulse' : ''}`}
    >
      {saved ? <FiCheck size={20} aria-hidden="true" /> : <FiDownload size={20} aria-hidden="true" />}
    </button>
  );
};

export default OfflineButton;
