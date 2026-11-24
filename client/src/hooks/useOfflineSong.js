import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { loadOffline, isSaved, saveOffline, removeOffline, subscribeOffline } from '../utils/offlineSongs';

/** Whether `song` is saved on this device, plus a toggle that saves or removes it. */
export const useOfflineSong = (song) => {
  const [, tick] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    loadOffline();
    return subscribeOffline(() => tick((n) => n + 1));
  }, []);

  const saved = !!song && isSaved(song._id);
  const toggle = useCallback(async () => {
    if (!song || busy) return;
    setBusy(true);
    try {
      if (saved) await removeOffline(song._id);
      else {
        await saveOffline(song);
        toast.success('Saved for offline');
      }
    } catch (e) {
      toast.error(e?.name === 'QuotaExceededError' ? 'Not enough storage on this device' : 'Could not save this song');
    } finally {
      setBusy(false);
    }
  }, [song, saved, busy]);

  return { saved, busy, toggle };
};
