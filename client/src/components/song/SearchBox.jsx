import { useEffect, useId, useRef, useState } from "react";
import { FiSearch, FiClock, FiMusic, FiUser } from "react-icons/fi";

import { useDebounce } from "../../hooks/useDebounce";
import { songService } from "../../services/songService";

const RECENT_KEY = "recentSearches";
const MAX_RECENT = 6;

// localStorage can throw (private windows, blocked storage); the box must still work.
const loadRecent = () => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(list) ? list.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
};
const saveRecent = (list) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* non-essential */
  }
};

const inputClass = `
w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 pl-14 text-white
backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-white/40
focus:border-violet-500 focus:bg-white/[0.08]
`;

/**
 * Search input with live suggestions (artists + songs) and remembered recent
 * searches. `value` / `onChange(text)` stay owned by the page, so the existing
 * debounced list search keeps working exactly as before. `onSubmit(text)` fires
 * when the user picks a suggestion or presses Enter (used by the top bar to jump to results).
 */
const SearchBox = ({ value, onChange, placeholder, onSubmit, inputClassName = inputClass }) => {
  const listId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState(loadRecent);

  const query = useDebounce(value.trim(), 250);

  // Fetch suggestions; ignore answers that arrive after the user typed something else.
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    let stale = false;
    songService
      .getSuggestions(query)
      .then((data) => !stale && setSuggestions(data.suggestions || []))
      .catch(() => !stale && setSuggestions([]));
    return () => {
      stale = true;
    };
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const onDown = (e) => rootRef.current && !rootRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const showingRecent = value.trim().length < 2;
  const items = showingRecent
    ? recent.map((text) => ({ type: "recent", text }))
    : suggestions;
  const visible = open && items.length > 0;

  const remember = (text) => {
    const t = text.trim();
    if (t.length < 2) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT);
    setRecent(next);
    saveRecent(next);
  };

  const choose = (item) => {
    onChange(item.text);
    remember(item.text);
    onSubmit?.(item.text);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (visible && active >= 0) {
        e.preventDefault();
        choose(items[active]);
      } else {
        remember(value);
        onSubmit?.(value.trim());
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const clearRecent = () => {
    setRecent([]);
    saveRecent([]);
  };

  const Icon = { artist: FiUser, song: FiMusic, recent: FiClock };

  return (
    <div ref={rootRef} className="relative">
      <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />

      <input
        type="text"
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={visible && active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClassName}
      />

      {visible && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#17171D] py-1 shadow-2xl"
        >
          {showingRecent && (
            <li className="flex items-center justify-between px-4 py-1.5 text-xs uppercase tracking-wide text-white/40" role="presentation">
              Recent searches
              <button onMouseDown={(e) => e.preventDefault()} onClick={clearRecent} className="normal-case text-violet-300 hover:underline">
                Clear
              </button>
            </li>
          )}
          {items.map((item, i) => {
            const ItemIcon = Icon[item.type];
            return (
              <li
                key={`${item.type}-${item.text}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown (not click) so the choice lands before the input loses focus
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(item);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm ${
                  i === active ? "bg-white/10" : ""
                }`}
              >
                <ItemIcon className="shrink-0 text-white/40" />
                <span className="min-w-0">
                  <span className="block truncate text-white">{item.text}</span>
                  {item.subtitle && <span className="block truncate text-xs text-white/50">{item.subtitle}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
