import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab / Shift+Tab inside the element `ref` points to while it is mounted (for modals),
 * moves focus into it if nothing inside has focus yet, and gives focus back to the opener on close.
 */
export const useFocusTrap = (ref) => {
  const opener = useRef(document.activeElement); // read during render, before the modal takes focus

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const items = () => [...root.querySelectorAll(FOCUSABLE)];
    if (!root.contains(document.activeElement)) (items()[0] || root).focus();

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const list = items();
      if (!list.length) return e.preventDefault();
      const first = list[0];
      const last = list[list.length - 1];
      if (!root.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const back = opener.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      if (back instanceof HTMLElement && document.contains(back)) back.focus();
    };
  }, [ref]);
};
