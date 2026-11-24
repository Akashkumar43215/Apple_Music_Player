// Two <audio> elements ("decks"): one plays while the other can be preloaded with the next song.
// The second deck is created only when asked for, so until then this behaves like one plain <audio>.
const make = () => {
  const a = new Audio();
  a.preload = 'metadata'; // do not download whole songs before play
  return a;
};

export const createDecks = () => {
  const decks = [make()];
  let activeIndex = 0;
  return {
    get active() {
      return decks[activeIndex];
    },
    /** The idle deck (created on first use). */
    other() {
      decks[1 - activeIndex] ??= make();
      return decks[1 - activeIndex];
    },
    /** Makes the idle deck the active one. */
    swap() {
      this.other();
      activeIndex = 1 - activeIndex;
    },
    all: () => decks.filter(Boolean),
  };
};

/**
 * iOS Safari ignores audio.volume (it always reads back 1), and a volume ramp is what
 * crossfading relies on. Call with a real element; false means "do not crossfade here".
 */
export const canControlVolume = (audio) => {
  const before = audio.volume;
  audio.volume = 0.5;
  const ok = audio.volume === 0.5;
  audio.volume = before;
  return ok;
};
