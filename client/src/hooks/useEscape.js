import { useEffect } from 'react';

/** Calls `onEscape` when the Escape key is pressed (for modals and menus). */
export const useEscape = (onEscape) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onEscape();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onEscape]);
};
