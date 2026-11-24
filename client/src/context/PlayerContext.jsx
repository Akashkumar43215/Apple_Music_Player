import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { getMediaUrl } from '../utils/format';
import { recentlyPlayedService } from '../services/recentlyPlayedService';
import { statsService } from '../services/statsService';
import { createDecks } from '../utils/audioDecks';
import { nextPosition } from '../utils/crossfade';

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

  // Keep the <audio> element's volume/mute in sync with state
  useEffect(() => {
    decks?.all().forEach((a) => {
      a.volume = volume;
      a.muted = isMuted;
    });
  }, [volume, isMuted]);

  // Load a new source whenever the current song changes
  useEffect(() => {
    const audio = decks?.active;
    if (!audio || !currentSong) return;

    flushListen(); // report what was heard of the previous song
    listenRef.current = { songId: currentSong._id, seconds: 0, lastTime: 0 };

    setIsLoading(true);
    audio.src = getMediaUrl(currentSong.audioUrl);
    audio.load();
    lastRecordedIdRef.current = null;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?._id]);

  const playNext = useCallback(() => {
    if (playOrder.length === 0) return;

    if (repeatMode === 'one') {
      const audio = decks?.active;
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
    setCurrentIndex(nextPos);
    setIsPlaying(true);
  }, [playOrder.length, currentIndex, repeatMode]);

  const playPrevious = useCallback(() => {
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

  // Wire up native audio element events once
  useEffect(() => {
    const audio = decks?.active;
    if (!audio) return;

    const onTimeUpdate = () => {
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
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      flushListen();
    };
    const onEnded = () => {
      flushListen();
      if (sleepRef.current?.type === 'song') {
        setSleepTimerState(null);
        setIsPlaying(false);
        return;
      }
      playNext();
    };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong, playNext]);

  // Report the last bit of listening if the player is torn down.
  useEffect(() => () => flushListen(), [flushListen]);

  // Pause when a timed sleep timer runs out; the cleanup also covers cancel/unmount.
  useEffect(() => {
    if (sleepTimer?.type !== 'time') return;
    const id = setTimeout(() => {
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
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, currentSong]);

  const seek = useCallback((time) => {
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
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};
