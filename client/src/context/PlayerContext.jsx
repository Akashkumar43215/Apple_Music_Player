import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { getMediaUrl } from '../utils/format';
import { recentlyPlayedService } from '../services/recentlyPlayedService';
import { statsService } from '../services/statsService';
import { createDecks, canControlVolume } from '../utils/audioDecks';
import { nextPosition, shouldStartFade, fadeGains, CROSSFADE_OPTIONS } from '../utils/crossfade';

// Saved crossfade length in seconds (0 = off); anything unexpected in storage counts as off.
const readCrossfade = () => {
  try {
    const n = Number(localStorage.getItem('crossfadeSec'));
    return CROSSFADE_OPTIONS.includes(n) ? n : 0;
  } catch {
    return 0;
  }
};

export const PlayerContext = createContext(null);

// Fisher-Yates shuffle of an index array, keeping `keepFirst` fixed at position 0
// so the currently-playing song doesn't jump when shuffle is turned on.
const shuffleIndices = (length, keepFirst) => {
  const rest = Array.from({ length }, (_, i) => i).filter((i) => i !== keepFirst);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return keepFirst === null ? rest : [keepFirst, ...rest];
};

/**
 * Owns the single <audio> element for the whole app (mounted once in
 * PlayerProvider, never remounted per-page) so playback survives navigation.
 * All player UI (PlayerBar, QueueDrawer, SongCard play buttons) reads and
 * controls playback exclusively through this context.
 */
export const PlayerProvider = ({ children }) => {
  const decksRef = useRef(null);
  if (!decksRef.current && typeof Audio !== 'undefined') decksRef.current = createDecks();
  const decks = decksRef.current; // decks.active is the <audio> element that is playing

  // Gapless playback starts the next song on the second deck without a user tap. We only trust
  // that where volume is controllable (not iOS Safari); there, playback stays on one element.
  const gaplessRef = useRef(null);
  if (gaplessRef.current === null) {
    gaplessRef.current = !!decks && canControlVolume(decks.active);
    if (gaplessRef.current) decks.other();
  }
  const preloadedRef = useRef(null); // { songId }: the idle deck is loading this song
  const adoptedRef = useRef(null); // id of a song that already started on the other deck (skip the reload)

  const [queue, setQueue] = useState([]); // original, unshuffled order
  const [playOrder, setPlayOrder] = useState([]); // array of indices into `queue`
  const [currentIndex, setCurrentIndex] = useState(0); // position within playOrder

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [isLoading, setIsLoading] = useState(false);

  const lastRecordedIdRef = useRef(null);

  // Real listening time for the stats page: seconds actually played (seeks and
  // pauses don't count), reported in chunks on pause / song change / every 30s.
  const listenRef = useRef({ songId: null, seconds: 0, lastTime: 0 });
  const flushListen = useCallback(() => {
    const r = listenRef.current;
    const seconds = Math.round(r.seconds);
    r.seconds = 0;
    if (r.songId && seconds >= 5) statsService.recordListen(r.songId, seconds).catch(() => {});
  }, []);

  // Sleep timer: null | { type: 'time', endsAt } | { type: 'song' }
  const [sleepTimer, setSleepTimerState] = useState(null);
  const sleepRef = useRef(null);
  useEffect(() => {
    sleepRef.current = sleepTimer;
  }, [sleepTimer]);

  const currentSong = playOrder.length > 0 ? queue[playOrder[currentIndex]] : null;

  // Crossfade length in seconds, 0 = off. Only effective where gapless playback works (see gaplessRef).
  const [crossfade, setCrossfadeState] = useState(readCrossfade);
  const crossfadeRef = useRef(crossfade);
  useEffect(() => {
    crossfadeRef.current = crossfade;
  }, [crossfade]);
  const setCrossfade = useCallback((sec) => {
    if (!CROSSFADE_OPTIONS.includes(sec)) return;
    setCrossfadeState(sec);
    try {
      localStorage.setItem('crossfadeSec', String(sec));
    } catch {
      /* storage unavailable (private mode): the choice lasts until the page closes */
    }
  }, []);

  const volumeRef = useRef(0.8);
  const fadeRef = useRef(null); // { timer, outgoing, incoming } while two songs overlap

  // Keep the <audio> element's volume/mute in sync with state (volume is the fade's job while one runs)
  useEffect(() => {
    volumeRef.current = volume;
    decks?.all().forEach((a) => {
      if (!fadeRef.current) a.volume = volume;
      a.muted = isMuted;
    });
  }, [volume, isMuted]);

  // Ends a crossfade at once: release the song that was fading out, restore full volume on both decks.
  const finishFade = useCallback(() => {
    const f = fadeRef.current;
    if (!f) return;
    fadeRef.current = null;
    clearInterval(f.timer);
    f.outgoing.pause();
    f.outgoing.removeAttribute('src');
    f.outgoing.load();
    f.outgoing.volume = volumeRef.current;
    f.incoming.volume = volumeRef.current;
  }, []);

  // Moves playback to the next song if it is already buffered on the idle deck. fadeMs > 0 overlaps
  // the two songs; 0 switches at once. Returns false when it cannot (the caller falls back to loading).
  const switchToPreloaded = useCallback((nextPos, nextSong, fadeMs) => {
    if (!gaplessRef.current || preloadedRef.current?.songId !== nextSong?._id || decks.other().readyState < 3) return false;
    const incoming = decks.other();
    const outgoing = decks.active;
    if (fadeMs > 0) incoming.volume = 0;
    incoming.play().catch(() => {
      setIsPlaying(false);
      finishFade();
    });
    decks.swap();
    if (fadeMs > 0) {
      const startedAt = Date.now();
      const step = () => {
        const progress = Math.min(1, (Date.now() - startedAt) / fadeMs);
        const g = fadeGains(progress);
        outgoing.volume = volumeRef.current * g.out;
        incoming.volume = volumeRef.current * g.in;
        if (progress >= 1) finishFade();
      };
      fadeRef.current = { timer: setInterval(step, 50), outgoing, incoming };
    } else {
      outgoing.pause();
      outgoing.removeAttribute('src'); // free the finished song's buffer; this deck is the idle one now
      outgoing.load();
    }
    preloadedRef.current = null;
    adoptedRef.current = nextSong._id;
    setDuration(incoming.duration || 0); // its loadedmetadata fired while it was preloading
    setCurrentTime(0);
    setIsLoading(false);
    setCurrentIndex(nextPos);
    setIsPlaying(true);
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishFade]);

  // Called on every timeupdate of the playing deck: starts the fade when the song is nearly over
  const maybeCrossfade = useCallback((audio) => {
    const sec = crossfadeRef.current;
    if (!sec || !gaplessRef.current || fadeRef.current || repeatMode === 'one' || sleepRef.current?.type === 'song') return;
    if (!shouldStartFade({ currentTime: audio.currentTime, duration: audio.duration, fadeSec: sec })) return;
    const pos = nextPosition(playOrder.length, currentIndex, repeatMode);
    const song = pos === null ? null : queue[playOrder[pos]];
    if (!song || song._id === currentSong?._id) return;
    // If the next song is not buffered yet this does nothing and is retried on the next tick
    switchToPreloaded(pos, song, Math.max(500, Math.min(sec, audio.duration - audio.currentTime) * 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, playOrder, currentIndex, repeatMode, currentSong?._id, switchToPreloaded]);

  // Load a new source whenever the current song changes
  useEffect(() => {
    const audio = decks?.active;
    if (!audio || !currentSong) return;

    flushListen(); // report what was heard of the previous song
    listenRef.current = { songId: currentSong._id, seconds: 0, lastTime: 0 };
    lastRecordedIdRef.current = null;

    // playNext already started this song on the other deck: nothing to load
    if (adoptedRef.current === currentSong._id) {
      adoptedRef.current = null;
      return;
    }

    setIsLoading(true);
    audio.src = getMediaUrl(currentSong.audioUrl);
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?._id]);

  // Start downloading the next song on the idle deck (called once the current one is under way)
  const preloadNext = useCallback(() => {
    if (!gaplessRef.current || repeatMode === 'one' || fadeRef.current) return;
    const pos = nextPosition(playOrder.length, currentIndex, repeatMode);
    const song = pos === null ? null : queue[playOrder[pos]];
    if (!song || song._id === currentSong?._id || preloadedRef.current?.songId === song._id) return;
    const idle = decks.other();
    idle.preload = 'auto';
    idle.src = getMediaUrl(song.audioUrl);
    idle.load();
    preloadedRef.current = { songId: song._id };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, playOrder, currentIndex, repeatMode, currentSong?._id]);

  const playNext = useCallback(() => {
    if (playOrder.length === 0) return;
    finishFade();
    const audio = decks?.active;

    if (repeatMode === 'one') {
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }

    const nextPos = nextPosition(playOrder.length, currentIndex, repeatMode);
    if (nextPos === null) {
      setIsPlaying(false); // reached the end of the queue, stop
      return;
    }
    const nextSong = queue[playOrder[nextPos]];

    // The "next" song is the one already playing (one-song queue on repeat all): start it over
    if (nextSong?._id === currentSong?._id) {
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }

    // Gapless: the idle deck already holds the next song, so switch to it instead of loading
    if (switchToPreloaded(nextPos, nextSong, 0)) return;

    setCurrentIndex(nextPos);
    setIsPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, playOrder, currentIndex, repeatMode, currentSong?._id, finishFade, switchToPreloaded]);

  const playPrevious = useCallback(() => {
    finishFade();
    const audio = decks?.active;
    // Standard UX: if more than 3s into the song, restart it instead of
    // going to the previous track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevPos = currentIndex - 1;
    if (prevPos < 0) {
      if (repeatMode === 'all') {
        setCurrentIndex(playOrder.length - 1);
      } else if (audio) {
        audio.currentTime = 0;
      }
      return;
    }
    setCurrentIndex(prevPos);
    setIsPlaying(true);
  }, [currentIndex, playOrder.length, repeatMode]);

  // Wire up native audio element events on every deck; only the active deck's events count
  useEffect(() => {
    if (!decks) return;

    const unbind = decks.all().map((audio) => {
      const live = (fn) => () => {
        if (audio === decks.active) fn();
      };

      const onTimeUpdate = live(() => {
        setCurrentTime(audio.currentTime);
        // Count only normal playback steps; big jumps are seeks or a repeat-one restart.
        const r = listenRef.current;
        const step = audio.currentTime - r.lastTime;
        r.lastTime = audio.currentTime;
        if (currentSong && r.songId === currentSong._id && step > 0 && step < 2) r.seconds += step;
        if (r.seconds >= 30) flushListen();
        // Count a play after 3s of listening (avoids logging accidental clicks)
        if (
          currentSong &&
          audio.currentTime > 3 &&
          lastRecordedIdRef.current !== currentSong._id
        ) {
          lastRecordedIdRef.current = currentSong._id;
          recentlyPlayedService.recordPlay(currentSong._id).catch(() => {});
        }
        if (audio.currentTime > 5) preloadNext();
        maybeCrossfade(audio);
      });
      const onLoadedMetadata = live(() => {
        setDuration(audio.duration || 0);
        setIsLoading(false);
      });
      const onPlay = live(() => setIsPlaying(true));
      const onPause = live(() => {
        setIsPlaying(false);
        flushListen();
        finishFade(); // the fading-out song must not keep playing under a paused player
      });
      const onEnded = live(() => {
        flushListen();
        if (sleepRef.current?.type === 'song') {
          setSleepTimerState(null);
          setIsPlaying(false);
          return;
        }
        playNext();
      });

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
      };
    });

    return () => unbind.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong, playNext, preloadNext, maybeCrossfade]);

  // Report the last bit of listening if the player is torn down.
  useEffect(() => () => flushListen(), [flushListen]);

  // Pause when a timed sleep timer runs out; the cleanup also covers cancel/unmount.
  useEffect(() => {
    if (sleepTimer?.type !== 'time') return;
    const id = setTimeout(() => {
      finishFade();
      decks?.active?.pause();
      setSleepTimerState(null);
    }, Math.max(0, sleepTimer.endsAt - Date.now()));
    return () => clearTimeout(id);
  }, [sleepTimer]);

  // option: minutes (number) | 'song' (stop after this song) | null (cancel)
  const setSleepTimer = useCallback((option) => {
    if (option === null) setSleepTimerState(null);
    else if (option === 'song') setSleepTimerState({ type: 'song' });
    else setSleepTimerState({ type: 'time', endsAt: Date.now() + option * 60000 });
  }, []);

  /**
   * Starts playing `song`, setting `songList` (defaults to just the one
   * song) as the queue. If the song is already in the current queue, jumps
   * to it instead of resetting the whole queue.
   */
  const playSong = useCallback(
    (song, songList) => {
      finishFade();
      const list = songList && songList.length > 0 ? songList : [song];
      const originalIndex = list.findIndex((s) => s._id === song._id);

      setQueue(list);
      const order = isShuffled ? shuffleIndices(list.length, originalIndex) : list.map((_, i) => i);
      setPlayOrder(order);
      setCurrentIndex(order.indexOf(originalIndex));
      setIsPlaying(true);
    },
    [isShuffled]
  );

  const togglePlay = useCallback(() => {
    const audio = decks?.active;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      finishFade();
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, currentSong]);

  const seek = useCallback((time) => {
    finishFade();
    const audio = decks?.active;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (v > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prevShuffled) => {
      const next = !prevShuffled;
      if (queue.length > 0) {
        const currentOriginalIndex = playOrder[currentIndex];
        const order = next
          ? shuffleIndices(queue.length, currentOriginalIndex)
          : queue.map((_, i) => i);
        setPlayOrder(order);
        setCurrentIndex(order.indexOf(currentOriginalIndex));
      }
      return next;
    });
  }, [queue, playOrder, currentIndex]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const jumpToQueueIndex = useCallback((posInPlayOrder) => {
    finishFade();
    setCurrentIndex(posInPlayOrder);
    setIsPlaying(true);
  }, []);

  const removeFromQueue = useCallback(
    (posInPlayOrder) => {
      if (posInPlayOrder === currentIndex) return; // can't remove the playing song
      const originalIndexToRemove = playOrder[posInPlayOrder];
      const newQueue = queue.filter((_, i) => i !== originalIndexToRemove);
      const newOrder = playOrder
        .filter((_, i) => i !== posInPlayOrder)
        .map((idx) => (idx > originalIndexToRemove ? idx - 1 : idx));
      const newCurrentOriginal = playOrder[currentIndex] > originalIndexToRemove ? playOrder[currentIndex] - 1 : playOrder[currentIndex];
      setQueue(newQueue);
      setPlayOrder(newOrder);
      setCurrentIndex(newOrder.indexOf(newCurrentOriginal));
    },
    [queue, playOrder, currentIndex]
  );

  // The upcoming queue in actual playback order, for the QueueDrawer
  const upcomingQueue = playOrder.map((originalIdx, pos) => ({
    song: queue[originalIdx],
    posInPlayOrder: pos,
    isCurrent: pos === currentIndex,
  }));

  const value = {
    currentSong,
    queue: upcomingQueue,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    jumpToQueueIndex,
    removeFromQueue,
    sleepTimer,
    setSleepTimer,
    crossfade,
    setCrossfade,
    crossfadeSupported: !!gaplessRef.current,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};
